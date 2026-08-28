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
const STALE_PR_DAYS = 2;
const DAILY_LOOKBACK_HOURS = 24;
const WEEKLY_LOOKBACK_HOURS = 168;
const DESCRIPTION_LIMIT = 600;
const SLACK_SECTION_LIMIT = 2900;

const CLAUDE_MODEL = "claude-opus-5";
const CLAUDE_TIMEOUT_MS = 180_000;
/**
 * The JSON envelope carries the whole usage report, so the default 1 MB buffer
 * is too tight to rely on.
 */
const CLAUDE_MAX_BUFFER = 10 * 1024 * 1024;
const COMMENT_SYSTEM_PROMPT = [
  "Jesteś częścią bota, który wysyła zespołowi podsumowanie GitHuba przed daily.",
  "Dostajesz dane w JSON i piszesz jedno lub dwa zdania po polsku.",
  "Zmieść się w 300 znakach. Krótkie zdanie jest lepsze od długiego.",
  "Pole window mówi, czy podsumowujesz jeden dzień, czy cały zeszły tydzień.",
  "Pole description to opis PR-a napisany przez autora. Bywa puste.",
  "Napisz, na co zespół ma zwrócić uwagę na dzisiejszym daily.",
  "Nie powtarzaj liczb, które i tak są w sekcjach poniżej.",
  "Nie witaj się, nie podsumowuj danych, nie używaj emoji ani list.",
  "Gdy nic nie wymaga uwagi, napisz jedno zdanie, że dzień jest spokojny.",
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

async function collect({ repo, token, since }) {
  const sinceQuery = since.toISOString().replace(/\.\d{3}Z$/, "Z");

  const [
    merged,
    toReview,
    approved,
    runs,
    openedIssues,
    closedIssues,
    releases,
  ] = await Promise.all([
    search(repo, token, `is:pr is:merged merged:>=${sinceQuery}`),
    search(repo, token, "is:pr is:open draft:false review:none"),
    search(repo, token, "is:pr is:open draft:false review:approved"),
    githubRequest(
      `/repos/${repo}/actions/runs?branch=main&status=failure&per_page=20`,
      token,
    ),
    search(repo, token, `is:issue created:>=${sinceQuery}`),
    search(repo, token, `is:issue closed:>=${sinceQuery}`),
    githubRequest(`/repos/${repo}/releases?per_page=5`, token),
  ]);

  return {
    merged,
    toReview,
    approved,
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

function pullRequestLine(item, now, { withAge }) {
  const marker =
    withAge &&
    now.getTime() - new Date(item.created_at).getTime() >=
      STALE_PR_DAYS * DAY_MS
      ? " :hourglass:"
      : "";
  const age = withAge ? ` · ${formatAge(item.created_at, now)}` : "";

  return `• ${link(item.html_url, `#${item.number} ${item.title}`)} — _${item.user?.login ?? "?"}_${age}${marker}`;
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

  const blocks = [];

  if (data.merged.length > 0) {
    blocks.push(
      section(
        `*:white_check_mark: Zmergowane do main (${data.merged.length})*\n` +
          bulletList(
            data.merged.map((item) =>
              pullRequestLine(item, now, { withAge: false }),
            ),
          ),
      ),
    );
  }

  if (data.toReview.length > 0) {
    blocks.push(
      section(
        `*:eyes: Czekają na review (${data.toReview.length})*\n` +
          bulletList(
            data.toReview.map((item) =>
              pullRequestLine(item, now, { withAge: true }),
            ),
          ),
      ),
    );
  }

  if (data.approved.length > 0) {
    blocks.push(
      section(
        `*:rocket: Zaakceptowane, do merge (${data.approved.length})*\n` +
          bulletList(
            data.approved.map((item) =>
              pullRequestLine(item, now, { withAge: true }),
            ),
          ),
      ),
    );
  }

  if (data.failedRuns.length > 0) {
    blocks.push(
      section(
        `*:red_circle: Nieudane CI na main (${data.failedRuns.length})*\n` +
          bulletList(
            data.failedRuns.map(
              (run) =>
                `• ${link(run.html_url, run.name)} — ${escapeMrkdwn((run.head_commit?.message ?? "").split("\n")[0])}`,
            ),
          ),
      ),
    );
  }

  const notes = [];

  if (data.openedIssues.length > 0) {
    notes.push(`• Nowe issues: ${data.openedIssues.length}`);
  }

  if (data.closedIssues.length > 0) {
    notes.push(`• Zamknięte issues: ${data.closedIssues.length}`);
  }

  for (const release of data.releases) {
    notes.push(`• Release: ${link(release.html_url, release.tag_name)}`);
  }

  if (notes.length > 0) {
    blocks.push(section(`*:memo: Issues i release*\n${bulletList(notes)}`));
  }

  if (blocks.length === 0) {
    blocks.push(section("_Brak ruchu w repozytorium od ostatniego daily._"));
  }

  if (comment) {
    heading.push(section(`_${escapeMrkdwn(comment)}_`));
  }

  return [...heading, ...blocks];
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

export function summarizeForPrompt(data, { weekly } = {}) {
  const titles = (items) => items.slice(0, 10).map((item) => item.title);

  return {
    window: weekly ? "lastWeek" : "sinceLastDaily",
    merged: data.merged.slice(0, 10).map(described),
    awaitingReview: data.toReview.slice(0, 10).map((item) => ({
      ...described(item),
      createdAt: item.created_at,
    })),
    approved: titles(data.approved),
    failedCi: data.failedRuns.slice(0, 10).map((run) => run.name),
    openedIssues: data.openedIssues.length,
    closedIssues: data.closedIssues.length,
    releases: data.releases.map((release) => release.tag_name),
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
        JSON.stringify(summarizeForPrompt(data, { weekly })),
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

  const comment = (envelope.result ?? "").trim();

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
