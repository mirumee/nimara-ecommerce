import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

/**
 * Collects the GitHub activity since the previous daily and posts one Block Kit
 * message to a Slack Incoming Webhook.
 *
 * Runs on plain Node with no dependencies so the workflow can skip `pnpm install`.
 */

const GITHUB_API = "https://api.github.com";
const MAX_LIST_ITEMS = 10;
/**
 * The median pull request in this repository merges the day it opens, so two
 * days already marks an outlier and five days means parked rather than in
 * flight.
 */
const WARN_PR_DAYS = 2;
const PARKED_PR_DAYS = 5;
const DAILY_LOOKBACK_HOURS = 24;
const WEEKLY_LOOKBACK_HOURS = 168;
const DESCRIPTION_LIMIT = 600;
const MAX_RELEASES_SHOWN = 2;
const SLACK_SECTION_LIMIT = 2900;

const CLAUDE_MODEL = "claude-opus-5";
const CLAUDE_TIMEOUT_MS = 180_000;
/**
 * The JSON envelope carries the whole usage report, so the default 1 MB buffer
 * is too tight to rely on.
 */
const CLAUDE_MAX_BUFFER = 10 * 1024 * 1024;
/**
 * A Slack section block rejects text over 3000 characters. The prompt asks for
 * ten sentences, and a model that overshoots must not cost the channel its
 * message.
 */
const COMMENT_LIMIT = 1200;
const COMMENT_SYSTEM_PROMPT = [
  "Jesteś częścią bota, który wysyła zespołowi podsumowanie GitHuba przed daily.",
  "Dostajesz dane w JSON i piszesz po polsku od trzech do dziesięciu zdań.",
  "Nigdy więcej niż dziesięć zdań. Każde zdanie krótkie, najwyżej piętnaście słów.",
  "Dane są pogrupowane po tym, kto wykonuje następny ruch.",
  "redCiOnMain blokuje wszystkich. blockedOnAuthor czeka na autora.",
  "unclaimed to PR-y, których nikt nie wziął do review.",
  "readyToMerge czeka tylko na kliknięcie merge.",
  "parked to PR-y odstawione od dawna, których nie ma w sekcjach wiadomości.",
  "Możesz wspomnieć najwyżej jeden odstawiony PR, gdy naprawdę wymaga decyzji.",
  "Pole window: sinceLastDaily to ostatnia doba, lastWeek to zeszły tydzień.",
  "Nie nazywaj doby tygodniem ani tygodnia dobą. Trzymaj się pola window.",
  "Pole description to opis PR-a napisany przez autora. Bywa puste.",
  "Napisz, co zespół ma rozstrzygnąć na dzisiejszym daily. Wskaż osobę, gdy to pomaga.",
  "Piszesz w stylu Bartosza Walaszka, autora Kapitana Bomby i Blondiego.",
  "Ton jest bezczelnie rzeczowy. Mówisz o drobiazgu z powagą raportu wojennego.",
  "Zdania są krótkie, oznajmujące, bez ozdobników. Puenta przychodzi bez zapowiedzi.",
  "Wolno ci jedno absurdalne porównanie albo dygresję. Jedno, nie trzy.",
  "Nie tłumacz żartu. Nie mrugaj do czytelnika. Nie używaj wulgaryzmów.",
  "Humor nigdy nie może zjeść treści. Po przeczytaniu ma być jasne, co robić.",
  "Nie wymyślaj faktów. Każde zdanie musi wynikać z danych, które dostałeś.",
  "Nie zmyślaj imion, numerów PR-ów ani powodów. Czego nie ma w JSON, tego nie ma.",
  "Nie powtarzaj liczb ani tytułów, które i tak są w sekcjach poniżej.",
  "Nie witaj się, nie używaj emoji ani list.",
  "Gdy nic nie czeka na ruch, napisz o tym. Spokojny dzień też można opisać ciekawie.",
].join(" ");

/**
 * Dependabot opens from its own branch namespace, which is the one property no
 * grouping, prefix, or bot rename can take away from it.
 */
const DEPENDABOT_HEAD = "dependabot/";
/**
 * The dependabot comment is a caption over a list that is already on screen, so
 * it gets a fraction of the room the main comment has.
 */
const DEPENDABOT_COMMENT_LIMIT = 400;
/**
 * A grouped bump rewrites one manifest per workspace it touches, so the changed
 * paths already say which part of the monorepo moves. The catalog is the one
 * version set that belongs to no workspace at all.
 */
const CATALOG_FILE = "pnpm-workspace.yaml";
const WORKSPACE_MANIFEST = /^((?:apps|packages)\/[^/]+)\/package\.json$/;
const ROOT_MANIFEST = "package.json";
const MAX_WORKSPACES_SHOWN = 4;
const MAX_PROMPT_BUMPS = 12;
/**
 * `workspace:*` and `catalog:` are pointers, not versions. A change to one is a
 * wiring change that Dependabot does not make.
 */
const VERSION_POINTER = /^(?:workspace|catalog):/;
const JSON_DEPENDENCY = /^([-+])\s*"([^"]+)"\s*:\s*"([^"]+)",?\s*$/;
const YAML_CATALOG_ENTRY =
  /^([-+])\s+"?([\w@][\w@./-]*)"?\s*:\s*"?([^"\s]+)"?\s*$/;
const DEPENDABOT_SYSTEM_PROMPT = [
  "Jesteś częścią bota, który wysyła zespołowi podsumowanie GitHuba przed daily.",
  "Podpisujesz sekcję o pull requestach Dependabota. Piszesz po polsku.",
  "Od jednego do trzech zdań. Każde krótkie, najwyżej piętnaście słów.",
  "Pole open to otwarte PR-y z gałęzi dependabot, posortowane od najnowszego.",
  "ci: red znaczy czerwone CI. approved: true znaczy, że czeka tylko na merge.",
  "ageDays to wiek PR-a w dniach. mergedCount to ile bumpów już weszło w tym oknie.",
  "Pole window: sinceLastDaily to ostatnia doba, lastWeek to zeszły tydzień.",
  "Powiedz, czy to klik do merge, czy ktoś musi usiąść do czerwonego CI.",
  "Wiek jest istotny. Bump, który wisi tydzień, zdążył się zestarzeć dwa razy.",
  "Pole workspaces mówi, które appki i paczki monorepo rusza dany PR.",
  "count to liczba paczek podbitych w tym workspace. root to manifest w korzeniu.",
  "catalog to wersje wspólne dla całego repo. Ruszają wszystko naraz.",
  "bumps to nazwy i wersje, od from do to. Możesz wymienić najwyżej dwie.",
  "Gdy bump rusza jedną appkę, powiedz którą. Gdy rusza pół repo, powiedz i to.",
  "Piszesz w stylu Bartosza Walaszka, autora Kapitana Bomby i Blondiego.",
  "Ton jest bezczelnie rzeczowy. Zdania krótkie, oznajmujące, bez ozdobników.",
  "Najwyżej jedno absurdalne porównanie. Nie tłumacz żartu, nie używaj wulgaryzmów.",
  "Nie witaj się, nie używaj emoji ani list. Nie powtarzaj tytułów z listy pod spodem.",
  "Nie wymyślaj faktów, nazw paczek ani wersji. Czego nie ma w JSON, tego nie ma.",
].join(" ");

/**
 * Dependabot security runs report as `dynamic`. They are not the team's CI and
 * would bury a real red build on main.
 */
const REPORTED_RUN_EVENTS = new Set([
  "push",
  "workflow_run",
  "schedule",
  "workflow_dispatch",
]);

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Monday opens the week with a recap of the whole previous one. Every other
 * weekday reports since the last daily. The override serves local testing and
 * does not change which of the two shapes the message takes.
 */
export function resolveWindow(now, override) {
  const weekly = now.getUTCDay() === 1;
  const parsed = Number(override);

  if (Number.isFinite(parsed) && parsed > 0) {
    return { lookbackHours: parsed, weekly };
  }

  return {
    lookbackHours: weekly ? WEEKLY_LOOKBACK_HOURS : DAILY_LOOKBACK_HOURS,
    weekly,
  };
}

export function escapeMrkdwn(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatAge(isoDate, now) {
  const elapsed = now.getTime() - new Date(isoDate).getTime();

  if (elapsed >= DAY_MS) {
    const days = Math.floor(elapsed / DAY_MS);

    return days === 1 ? "1 dzień" : `${days} dni`;
  }

  return `${Math.max(0, Math.floor(elapsed / HOUR_MS))} godz.`;
}

function link(url, label) {
  return `<${url}|${escapeMrkdwn(label)}>`;
}

function bulletList(lines) {
  const shown = lines.slice(0, MAX_LIST_ITEMS);
  const hidden = lines.length - shown.length;

  if (hidden > 0) {
    shown.push(`_…i ${hidden} więcej_`);
  }

  return shown.join("\n").slice(0, SLACK_SECTION_LIMIT);
}

function section(text) {
  return { type: "section", text: { type: "mrkdwn", text } };
}

async function githubRequest(path, token) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 200);

    throw new Error(`GitHub ${response.status} for ${path}: ${body}`);
  }

  return response.json();
}

function search(repo, token, query) {
  const q = encodeURIComponent(`repo:${repo} ${query}`);

  return githubRequest(
    `/search/issues?q=${q}&per_page=50&sort=updated&order=desc`,
    token,
  ).then((result) => result.items ?? []);
}

/**
 * Keep the newest failure per workflow and commit. A retried run adds nothing new.
 */
function dedupeRuns(runs) {
  const newest = new Map();

  for (const run of runs) {
    const key = `${run.name}@${run.head_sha}`;

    if (!newest.has(key)) {
      newest.set(key, run);
    }
  }

  return [...newest.values()];
}

/**
 * Every open pull request has exactly one owner of the next move. A red build or
 * a requested change puts the ball with the author and outranks an approval,
 * because nobody should merge a pull request whose checks are failing.
 */
export function classifyOpenPullRequests({
  unreviewed,
  changesRequested,
  failingChecks,
  approved,
}) {
  const authorsTurn = new Map();

  for (const [items, reason] of [
    [failingChecks, "CI czerwone"],
    [changesRequested, "zmiany do poprawy"],
  ]) {
    for (const item of items) {
      if (!authorsTurn.has(item.number)) {
        authorsTurn.set(item.number, { ...item, reason });
      }
    }
  }

  const claimed = new Set(authorsTurn.keys());

  return {
    blockedOnAuthor: [...authorsTurn.values()],
    unclaimed: unreviewed.filter((item) => !claimed.has(item.number)),
    readyToMerge: approved.filter((item) => !claimed.has(item.number)),
  };
}

async function collect({ repo, token, since }) {
  const sinceQuery = since.toISOString().replace(/\.\d{3}Z$/, "Z");

  const open = "is:pr is:open draft:false";
  const fromDependabot = `head:${DEPENDABOT_HEAD}`;

  const [
    merged,
    unreviewed,
    changesRequested,
    failingChecks,
    approved,
    runs,
    openedIssues,
    closedIssues,
    releases,
    dependabotOpen,
    dependabotMerged,
  ] = await Promise.all([
    search(repo, token, `is:pr is:merged merged:>=${sinceQuery}`),
    search(repo, token, `${open} review:none`),
    search(repo, token, `${open} review:changes_requested`),
    search(repo, token, `${open} status:failure`),
    search(repo, token, `${open} review:approved`),
    githubRequest(
      `/repos/${repo}/actions/runs?branch=main&status=failure&per_page=20`,
      token,
    ),
    search(repo, token, `is:issue created:>=${sinceQuery}`),
    search(repo, token, `is:issue closed:>=${sinceQuery}`),
    githubRequest(`/repos/${repo}/releases?per_page=5`, token),
    search(repo, token, `${open} ${fromDependabot}`),
    search(
      repo,
      token,
      `is:pr is:merged merged:>=${sinceQuery} ${fromDependabot}`,
    ),
  ]);

  const dependabot = await withBumpDetail(
    markDependabotState(dependabotOpen, { failingChecks, approved }),
    { repo, token },
  );
  const claimedByBot = new Set(dependabot.map((item) => item.number));
  const humans = (items) =>
    items.filter((item) => !claimedByBot.has(item.number));

  return {
    merged,
    ...classifyOpenPullRequests({
      unreviewed: humans(unreviewed),
      changesRequested: humans(changesRequested),
      failingChecks: humans(failingChecks),
      approved: humans(approved),
    }),
    dependabot,
    dependabotMergedCount: dependabotMerged.length,
    failedRuns: dedupeRuns(
      (runs.workflow_runs ?? []).filter(
        (run) =>
          new Date(run.created_at) >= since &&
          REPORTED_RUN_EVENTS.has(run.event),
      ),
    ),
    openedIssues,
    closedIssues,
    releases: releases.filter(
      (release) =>
        release.published_at && new Date(release.published_at) >= since,
    ),
  };
}

/**
 * Parked pull requests repeat every morning and turn the message into wallpaper.
 * The daily message counts them; Monday lists them.
 */
export function ageBucket(isoDate, now) {
  const days = (now.getTime() - new Date(isoDate).getTime()) / DAY_MS;

  if (days >= PARKED_PR_DAYS) {
    return "parked";
  }

  return days >= WARN_PR_DAYS ? "warn" : "fresh";
}

function splitParked(items, now, weekly) {
  if (weekly) {
    return { shown: items, parked: 0 };
  }

  const shown = items.filter(
    (item) => ageBucket(item.created_at, now) !== "parked",
  );

  return { shown, parked: items.length - shown.length };
}

function pullRequestLine(item, now) {
  const marker =
    ageBucket(item.created_at, now) === "fresh" ? "" : " :small_red_triangle:";
  const reason = item.reason ? ` — ${item.reason}` : "";

  return (
    `• ${link(item.html_url, `#${item.number} ${item.title}`)}` +
    ` — _${item.user?.login ?? "?"}_${reason} · ${formatAge(item.created_at, now)}${marker}`
  );
}

function parseBumps(patch, pattern) {
  const before = new Map();
  const after = new Map();

  for (const line of patch.split("\n")) {
    const match = pattern.exec(line);

    if (!match) {
      continue;
    }

    const [, sign, name, version] = match;

    if (VERSION_POINTER.test(version)) {
      continue;
    }

    (sign === "-" ? before : after).set(name, version);
  }

  return [...after.entries()]
    .filter(([name, version]) => before.get(name) !== version)
    .map(([name, to]) => ({ name, to, from: before.get(name) ?? null }));
}

function workspaceOf(filename) {
  if (filename === ROOT_MANIFEST) {
    return "root";
  }

  return WORKSPACE_MANIFEST.exec(filename)?.[1] ?? null;
}

export function summarizeBumpedFiles(files) {
  const workspaces = [];
  let catalog = [];

  for (const file of files) {
    const patch = file.patch ?? "";

    if (file.filename === CATALOG_FILE) {
      catalog = parseBumps(patch, YAML_CATALOG_ENTRY);

      continue;
    }

    const name = workspaceOf(file.filename);
    const bumps = name ? parseBumps(patch, JSON_DEPENDENCY) : [];

    if (bumps.length > 0) {
      workspaces.push({ name, bumps });
    }
  }

  return { workspaces, catalog };
}

/**
 * The changed paths cost one request per open bump, and this repository sees one
 * or two a week. A failure here loses the breakdown, never the message.
 */
async function withBumpDetail(items, { repo, token }) {
  return Promise.all(
    items.map(async (item, index) => {
      if (index >= MAX_LIST_ITEMS) {
        return item;
      }

      try {
        const files = await githubRequest(
          `/repos/${repo}/pulls/${item.number}/files?per_page=100`,
          token,
        );

        return { ...item, detail: summarizeBumpedFiles(files) };
      } catch (error) {
        console.warn(
          `Bump detail skipped for #${item.number}: ${error.message}`,
        );

        return item;
      }
    }),
  );
}

/**
 * Counting beats naming once a bump crosses half the repository. The workspace
 * with the most bumps is the one whose build breaks first.
 */
export function workspaceBreakdown(detail) {
  if (!detail) {
    return "";
  }

  const parts = [];

  for (const [label, prefix] of [
    ["apps", "apps/"],
    ["packages", "packages/"],
  ]) {
    const matching = detail.workspaces
      .filter((workspace) => workspace.name.startsWith(prefix))
      .sort((a, b) => b.bumps.length - a.bumps.length);

    if (matching.length === 0) {
      continue;
    }

    const shown = matching
      .slice(0, MAX_WORKSPACES_SHOWN)
      .map(
        (workspace) =>
          `${workspace.name.slice(prefix.length)} (${workspace.bumps.length})`,
      );
    const hidden = matching.length - shown.length;

    if (hidden > 0) {
      shown.push(`+${hidden}`);
    }

    parts.push(`${label}: ${shown.join(", ")}`);
  }

  const root = detail.workspaces.find((workspace) => workspace.name === "root");

  if (root) {
    parts.push(`root: ${root.bumps.length}`);
  }

  if (detail.catalog.length > 0) {
    parts.push(
      `catalog: ${detail.catalog.map((bump) => bump.name).join(", ")}`,
    );
  }

  return parts.join(" · ");
}

/**
 * A dependency bump owns no reviewer and no author to nag, so its next move is
 * only ever merge it or fix its build. The two search results the message
 * already has answer that without another round trip.
 */
export function markDependabotState(items, { failingChecks, approved }) {
  const failing = new Set(failingChecks.map((item) => item.number));
  const signed = new Set(approved.map((item) => item.number));

  return items.map((item) => ({
    ...item,
    ci: failing.has(item.number) ? "red" : null,
    approved: signed.has(item.number),
  }));
}

/**
 * The author is `dependabot[bot]` on every line, so the room goes to the state
 * that decides who has to do something about it.
 */
function dependabotLine(item, now) {
  const marker =
    ageBucket(item.created_at, now) === "fresh" ? "" : " :small_red_triangle:";
  const state =
    item.ci === "red"
      ? " — CI czerwone"
      : item.approved
        ? " — zatwierdzony"
        : "";

  const head =
    `• ${link(item.html_url, `#${item.number} ${item.title}`)}${state}` +
    ` · ${formatAge(item.created_at, now)}${marker}`;
  const breakdown = workspaceBreakdown(item.detail);

  return breakdown ? `${head}\n    ↳ _${escapeMrkdwn(breakdown)}_` : head;
}

/**
 * Grouped bumps land as a couple of pull requests a week and stay open past the
 * parked threshold by design, so this section never hides an entry by age. A
 * bump nobody can see is a bump nobody merges.
 */
export function dependabotSection(items, now, comment) {
  if (items.length === 0) {
    return null;
  }

  const body = [
    `*:robot_face: Dependabot (${items.length})*`,
    ...(comment ? [`_${escapeMrkdwn(comment)}_`] : []),
    bulletList(items.map((item) => dependabotLine(item, now))),
  ].join("\n");

  return section(body.slice(0, SLACK_SECTION_LIMIT));
}

function queueSection(title, items, now, weekly) {
  const { shown, parked } = splitParked(items, now, weekly);

  if (shown.length === 0) {
    return { block: null, parked };
  }

  return {
    block: section(
      `*${title} (${shown.length})*\n` +
        bulletList(shown.map((item) => pullRequestLine(item, now))),
    ),
    parked,
  };
}

export function buildBlocks(
  data,
  { repo, now, lookbackHours, weekly, comment, dependabotComment },
) {
  const heading = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: weekly
          ? "Podsumowanie zeszłego tygodnia"
          : "Podsumowanie GitHub przed daily",
        emoji: true,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${link(`https://github.com/${repo}`, repo)} · ostatnie ${lookbackHours} godz.`,
        },
      ],
    },
  ];

  if (comment) {
    heading.push(section(`_${escapeMrkdwn(comment)}_`));
  }

  const blocks = [];

  if (data.failedRuns.length > 0) {
    blocks.push(
      section(
        `*:red_circle: Blokuje wszystkich (${data.failedRuns.length})*\n` +
          bulletList(
            data.failedRuns.map(
              (run) =>
                `• ${link(run.html_url, run.name)} — ${escapeMrkdwn((run.head_commit?.message ?? "").split("\n")[0])}`,
            ),
          ),
      ),
    );
  }

  let parked = 0;

  for (const [title, items] of [
    [":raised_back_of_hand: Czeka na autora", data.blockedOnAuthor],
    [":eyes: Nikt nie wziął", data.unclaimed],
    [":rocket: Jeden klik do merge", data.readyToMerge],
  ]) {
    const result = queueSection(title, items, now, weekly);

    parked += result.parked;

    if (result.block) {
      blocks.push(result.block);
    }
  }

  const dependabotBlock = dependabotSection(
    data.dependabot ?? [],
    now,
    dependabotComment,
  );

  if (dependabotBlock) {
    blocks.push(dependabotBlock);
  }

  if (blocks.length === 0) {
    blocks.push(section("_Nic nie czeka na ruch._"));
  }

  return [...heading, ...blocks, backgroundBlock(data, { parked, weekly })];
}

/**
 * Merged pull requests, issue counts, and releases generate no decision, so they
 * belong in one small line rather than in a list of their own.
 */
function backgroundBlock(data, { parked, weekly }) {
  const notes = [];

  if (data.merged.length > 0) {
    notes.push(
      `${data.merged.length} ${weekly ? "PR-ów w tygodniu" : "PR-ów zmergowanych"}`,
    );
  }

  for (const release of data.releases.slice(0, MAX_RELEASES_SHOWN)) {
    notes.push(link(release.html_url, release.tag_name));
  }

  if (data.releases.length > MAX_RELEASES_SHOWN) {
    notes.push(`+${data.releases.length - MAX_RELEASES_SHOWN} release`);
  }

  if (data.openedIssues.length > 0) {
    notes.push(`nowe issues: ${data.openedIssues.length}`);
  }

  if (data.closedIssues.length > 0) {
    notes.push(`zamknięte issues: ${data.closedIssues.length}`);
  }

  if (parked > 0) {
    notes.push(`odstawione: ${parked} (lista w pon.)`);
  }

  return {
    type: "context",
    elements: [
      { type: "mrkdwn", text: notes.join(" · ") || "bez zmian w tle" },
    ],
  };
}

/**
 * The pull request body is the author's own words about the change. It is the
 * cheapest context that beats a title, and the tail of a long one is boilerplate
 * from the template.
 */
function described(item) {
  const body = (item.body ?? "").trim();

  return {
    title: item.title,
    description: body ? body.slice(0, DESCRIPTION_LIMIT) : null,
  };
}

/**
 * Parked pull requests are missing from the message on a weekday. The comment is
 * the one place that can still nudge about them, so it needs to know they exist.
 */
function parkedFor(data, now, weekly) {
  if (weekly) {
    return [];
  }

  return [data.blockedOnAuthor, data.unclaimed, data.readyToMerge]
    .flat()
    .filter((item) => ageBucket(item.created_at, now) === "parked")
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      author: item.user?.login ?? null,
      ageDays: Math.floor(
        (now.getTime() - new Date(item.created_at).getTime()) / DAY_MS,
      ),
    }));
}

export function summarizeForPrompt(data, { weekly, now = new Date() } = {}) {
  const visible = (items) => splitParked(items, now, weekly).shown;
  const queue = (items) =>
    items.slice(0, 10).map((item) => ({
      ...described(item),
      author: item.user?.login ?? null,
      ageDays: Math.floor(
        (now.getTime() - new Date(item.created_at).getTime()) / DAY_MS,
      ),
      ...(item.reason ? { reason: item.reason } : {}),
    }));

  return {
    window: weekly ? "lastWeek" : "sinceLastDaily",
    redCiOnMain: data.failedRuns.slice(0, 10).map((run) => run.name),
    blockedOnAuthor: queue(visible(data.blockedOnAuthor)),
    unclaimed: queue(visible(data.unclaimed)),
    parked: parkedFor(data, now, weekly),
    readyToMerge: visible(data.readyToMerge)
      .slice(0, 10)
      .map((item) => ({ title: item.title, author: item.user?.login ?? null })),
    mergedCount: data.merged.length,
    merged: data.merged.slice(0, 10).map(described),
    openedIssues: data.openedIssues.length,
    closedIssues: data.closedIssues.length,
    releases: data.releases.map((release) => release.tag_name),
  };
}

/**
 * The same dependency moves in every workspace that declares it, and repeating
 * that in the prompt only teaches the model to repeat it in the comment.
 */
function distinctBumps(detail) {
  const seen = new Map();

  for (const workspace of detail?.workspaces ?? []) {
    for (const bump of workspace.bumps) {
      if (!seen.has(bump.name)) {
        seen.set(bump.name, bump);
      }
    }
  }

  for (const bump of detail?.catalog ?? []) {
    seen.set(bump.name, bump);
  }

  return [...seen.values()].slice(0, MAX_PROMPT_BUMPS);
}

export function summarizeDependabotForPrompt(
  data,
  { weekly, now = new Date() } = {},
) {
  return {
    window: weekly ? "lastWeek" : "sinceLastDaily",
    open: (data.dependabot ?? []).slice(0, MAX_LIST_ITEMS).map((item) => ({
      title: item.title,
      ageDays: Math.floor(
        (now.getTime() - new Date(item.created_at).getTime()) / DAY_MS,
      ),
      ci: item.ci ?? null,
      approved: Boolean(item.approved),
      workspaces: (item.detail?.workspaces ?? []).map((workspace) => ({
        name: workspace.name,
        count: workspace.bumps.length,
      })),
      catalog: (item.detail?.catalog ?? []).map((bump) => bump.name),
      bumps: distinctBumps(item.detail),
    })),
    mergedCount: data.dependabotMergedCount ?? 0,
  };
}

const execFileAsync = promisify(execFile);

/**
 * Runs Claude Code in headless mode. The subscription token from
 * `claude setup-token` authenticates Claude Code, not a hand-written HTTP
 * client, so the CLI is the supported way to spend a subscription here.
 *
 * The comment is a nice-to-have. Any failure returns null so the summary still
 * reaches the channel.
 */
async function runClaude(payload, systemPrompt, limit) {
  try {
    // An empty directory keeps the repository's CLAUDE.md, settings, and hooks
    // out of a session that only has to rewrite one JSON payload.
    const cwd = await mkdtemp(join(tmpdir(), "daily-summary-"));

    const { stdout } = await execFileAsync(
      "claude",
      [
        "--print",
        JSON.stringify(payload),
        "--system-prompt",
        systemPrompt,
        "--model",
        CLAUDE_MODEL,
        "--output-format",
        "json",
        "--max-turns",
        "1",
        "--restricted",
      ],
      { cwd, timeout: CLAUDE_TIMEOUT_MS, maxBuffer: CLAUDE_MAX_BUFFER },
    );

    return readComment(stdout, limit);
  } catch (error) {
    console.warn(`Claude comment skipped: ${error.message}`);

    return null;
  }
}

function requestComment(data, { weekly }) {
  return runClaude(
    summarizeForPrompt(data, { weekly, now: new Date() }),
    COMMENT_SYSTEM_PROMPT,
    COMMENT_LIMIT,
  );
}

/**
 * No open bump means no section to caption, and a call to skip.
 */
function requestDependabotComment(data, { weekly }) {
  if ((data.dependabot ?? []).length === 0) {
    return Promise.resolve(null);
  }

  return runClaude(
    summarizeDependabotForPrompt(data, { weekly, now: new Date() }),
    DEPENDABOT_SYSTEM_PROMPT,
    DEPENDABOT_COMMENT_LIMIT,
  );
}

/**
 * The envelope reports its own failures in `is_error` rather than by a non-zero
 * exit code, so a successful process is not yet a usable answer.
 */
export function readComment(stdout, limit = COMMENT_LIMIT) {
  let envelope;

  try {
    envelope = JSON.parse(stdout);
  } catch {
    console.warn("Claude returned output that is not JSON.");

    return null;
  }

  if (envelope.is_error || envelope.subtype !== "success") {
    console.warn(
      `Claude reported ${envelope.subtype ?? "an error"}: ${envelope.api_error_status ?? "no status"}`,
    );

    return null;
  }

  const comment = (envelope.result ?? "").trim().slice(0, limit);

  return comment || null;
}

async function postToSlack(webhookUrl, { blocks, text }) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });

  if (!response.ok) {
    throw new Error(
      `Slack ${response.status}: ${(await response.text()).slice(0, 200)}`,
    );
  }
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }

  return value;
}

async function main() {
  const token = requireEnv("GITHUB_TOKEN");
  const repo = requireEnv("GITHUB_REPOSITORY");
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const webhookUrl = dryRun
    ? process.env.SLACK_WEBHOOK_URL
    : requireEnv("SLACK_WEBHOOK_URL");

  const now = new Date();
  const { lookbackHours, weekly } = resolveWindow(
    now,
    process.env.LOOKBACK_HOURS,
  );
  const since = new Date(now.getTime() - lookbackHours * HOUR_MS);

  let blocks;

  try {
    const data = await collect({ repo, token, since });
    const [comment, dependabotComment] = await Promise.all([
      requestComment(data, { weekly }),
      requestDependabotComment(data, { weekly }),
    ]);

    blocks = buildBlocks(data, {
      repo,
      now,
      lookbackHours,
      weekly,
      comment,
      dependabotComment,
    });
  } catch (error) {
    // A silent channel hides the outage. Report it and still fail the workflow.
    const notice = `:warning: Nie udało się zebrać podsumowania z GitHuba: ${escapeMrkdwn(error.message)}`;

    if (!dryRun && webhookUrl) {
      await postToSlack(webhookUrl, {
        blocks: [section(notice)],
        text: notice,
      });
    }

    throw error;
  }

  const text = weekly
    ? "Podsumowanie zeszłego tygodnia"
    : "Podsumowanie GitHub przed daily";

  if (dryRun) {
    console.log(JSON.stringify({ text, blocks }, null, 2));

    return;
  }

  await postToSlack(webhookUrl, { blocks, text });
  console.log(
    `Posted ${blocks.length} blocks for the last ${lookbackHours} hours.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
