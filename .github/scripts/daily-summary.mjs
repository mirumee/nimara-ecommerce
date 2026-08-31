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
  "ciWarnings to ostrzeżenia GitHub Actions na main. Nikogo nie blokują, to dług.",
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
 * Dependabot security runs report as `dynamic`. They are not the team's CI and
 * would bury a real red build on main.
 */
const REPORTED_RUN_EVENTS = new Set([
  "push",
  "workflow_run",
  "schedule",
  "workflow_dispatch",
]);

const MAX_ANNOTATED_RUNS = 12;
const MAX_JOBS_PER_RUN = 20;
const MAX_WARNINGS_IN_PROMPT = 5;
const WARNING_LIMIT = 220;

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

function newestPerWorkflow(runs) {
  const newest = new Map();

  for (const run of runs) {
    if (!newest.has(run.name)) {
      newest.set(run.name, run);
    }
  }

  return [...newest.values()];
}

export function warningHeadline(message) {
  const clean = String(message)
    .replace(/\s*(For more information,?\s*see:?)?\s*https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return clean
    .split(/[:.](?=\s)/)[0]
    .trim()
    .slice(0, WARNING_LIMIT);
}

export function groupWarnings(entries) {
  const byMessage = new Map();

  for (const entry of entries) {
    const group = byMessage.get(entry.message);

    if (!group) {
      byMessage.set(entry.message, {
        message: entry.message,
        workflows: [{ name: entry.workflow, url: entry.url }],
      });

      continue;
    }

    if (!group.workflows.some((workflow) => workflow.name === entry.workflow)) {
      group.workflows.push({ name: entry.workflow, url: entry.url });
    }
  }

  return [...byMessage.values()];
}

async function warningsForRun({ repo, token, run }) {
  const { jobs = [] } = await githubRequest(
    `/repos/${repo}/actions/runs/${run.id}/jobs?per_page=${MAX_JOBS_PER_RUN}`,
    token,
  );

  const perJob = await Promise.all(
    jobs.map((job) =>
      githubRequest(`/repos/${repo}/check-runs/${job.id}/annotations`, token),
    ),
  );

  return perJob
    .flat()
    .filter((annotation) => annotation.annotation_level === "warning")
    .map((annotation) => ({
      workflow: run.name,
      url: run.html_url,
      message: warningHeadline(annotation.message),
    }));
}

async function collectWarnings({ repo, token, since }) {
  try {
    const { workflow_runs: runs = [] } = await githubRequest(
      `/repos/${repo}/actions/runs?branch=main&per_page=50`,
      token,
    );

    const recent = newestPerWorkflow(
      runs.filter(
        (run) =>
          new Date(run.created_at) >= since &&
          REPORTED_RUN_EVENTS.has(run.event),
      ),
    ).slice(0, MAX_ANNOTATED_RUNS);

    const found = await Promise.all(
      recent.map((run) => warningsForRun({ repo, token, run })),
    );

    return groupWarnings(found.flat());
  } catch (error) {
    console.warn(`CI warnings skipped: ${error.message}`);

    return [];
  }
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
    ciWarnings,
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
    collectWarnings({ repo, token, since }),
  ]);

  return {
    merged,
    ...classifyOpenPullRequests({
      unreviewed,
      changesRequested,
      failingChecks,
      approved,
    }),
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
    ciWarnings,
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
  { repo, now, lookbackHours, weekly, comment },
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

  if (blocks.length === 0) {
    blocks.push(section("_Nic nie czeka na ruch._"));
  }

  if (data.ciWarnings.length > 0) {
    blocks.push(
      section(
        `*:warning: Ostrzeżenia CI na main (${data.ciWarnings.length})*\n` +
          bulletList(
            data.ciWarnings.map(
              (warning) =>
                `• ${escapeMrkdwn(warning.message)}\n  _${warning.workflows
                  .map((workflow) => link(workflow.url, workflow.name))
                  .join(", ")}_`,
            ),
          ),
      ),
    );
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
    ciWarnings: data.ciWarnings
      .slice(0, MAX_WARNINGS_IN_PROMPT)
      .map((warning) => ({
        message: warning.message,
        workflows: warning.workflows.map((workflow) => workflow.name),
      })),
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
async function requestComment(data, { weekly }) {
  try {
    // An empty directory keeps the repository's CLAUDE.md, settings, and hooks
    // out of a session that only has to rewrite one JSON payload.
    const cwd = await mkdtemp(join(tmpdir(), "daily-summary-"));

    const { stdout } = await execFileAsync(
      "claude",
      [
        "--print",
        JSON.stringify(summarizeForPrompt(data, { weekly, now: new Date() })),
        "--system-prompt",
        COMMENT_SYSTEM_PROMPT,
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

    return readComment(stdout);
  } catch (error) {
    console.warn(`Claude comment skipped: ${error.message}`);

    return null;
  }
}

/**
 * The envelope reports its own failures in `is_error` rather than by a non-zero
 * exit code, so a successful process is not yet a usable answer.
 */
export function readComment(stdout) {
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

  const comment = (envelope.result ?? "").trim().slice(0, COMMENT_LIMIT);

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
    const comment = await requestComment(data, { weekly });

    blocks = buildBlocks(data, { repo, now, lookbackHours, weekly, comment });
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
