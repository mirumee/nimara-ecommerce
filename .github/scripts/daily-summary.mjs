/**
 * Collects the GitHub activity since the previous daily and posts one Block Kit
 * message to a Slack Incoming Webhook.
 *
 * Runs on plain Node with no dependencies so the workflow can skip `pnpm install`.
 */

const GITHUB_API = "https://api.github.com";
const MAX_LIST_ITEMS = 10;
const STALE_PR_DAYS = 2;
const DEFAULT_LOOKBACK_HOURS = 24;
const MONDAY_LOOKBACK_HOURS = 72;
const SLACK_SECTION_LIMIT = 2900;

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_OAUTH_BETA = "oauth-2025-04-20";
const OAUTH_TOKEN_PREFIX = "sk-ant-oat";
const ANTHROPIC_MODEL = "claude-opus-5";
/**
 * Adaptive thinking is on by default and its tokens count against max_tokens,
 * so a two-sentence answer still needs headroom.
 */
const ANTHROPIC_MAX_TOKENS = 4000;
const COMMENT_SYSTEM_PROMPT = [
  "Jesteś częścią bota, który wysyła zespołowi podsumowanie GitHuba przed daily.",
  "Dostajesz dane w JSON i piszesz jedno lub dwa zdania po polsku.",
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
 * Monday must reach back over the weekend, otherwise Friday afternoon work is
 * never reported.
 */
export function resolveLookbackHours(now, override) {
  const parsed = Number(override);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return now.getUTCDay() === 1 ? MONDAY_LOOKBACK_HOURS : DEFAULT_LOOKBACK_HOURS;
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

export function buildBlocks(data, { repo, now, lookbackHours, comment }) {
  const heading = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Podsumowanie GitHub przed daily",
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
 * A subscription token from `claude setup-token` authenticates as a bearer
 * token, not as an API key. Sending it on `x-api-key` returns 401, which is
 * indistinguishable from a revoked key unless the caller knows the difference.
 */
export function resolveAuth(env) {
  const oauthToken = env.CLAUDE_CODE_OAUTH_TOKEN;

  if (oauthToken) {
    return { headers: bearerHeaders(oauthToken) };
  }

  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (apiKey.startsWith(OAUTH_TOKEN_PREFIX)) {
    return {
      headers: bearerHeaders(apiKey),
      notice:
        "ANTHROPIC_API_KEY holds a subscription token. Move it to CLAUDE_CODE_OAUTH_TOKEN.",
    };
  }

  return { headers: { "x-api-key": apiKey } };
}

function bearerHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "anthropic-beta": ANTHROPIC_OAUTH_BETA,
  };
}

/**
 * Strips the collected data down to what the comment needs. Sending whole API
 * payloads would cost tokens and add nothing.
 */
export function summarizeForPrompt(data) {
  const titles = (items) => items.slice(0, 10).map((item) => item.title);

  return {
    merged: titles(data.merged),
    awaitingReview: data.toReview.slice(0, 10).map((item) => ({
      title: item.title,
      createdAt: item.created_at,
    })),
    approved: titles(data.approved),
    failedCi: data.failedRuns.slice(0, 10).map((run) => run.name),
    openedIssues: data.openedIssues.length,
    closedIssues: data.closedIssues.length,
    releases: data.releases.map((release) => release.tag_name),
  };
}

/**
 * The comment is a nice-to-have. Any failure returns null so the summary still
 * reaches the channel.
 */
async function requestComment(auth, data) {
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "anthropic-version": ANTHROPIC_VERSION,
        ...auth.headers,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        output_config: { effort: "low" },
        system: COMMENT_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify(summarizeForPrompt(data)),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(
        `Claude ${response.status}: ${(await response.text()).slice(0, 200)}`,
      );

      return null;
    }

    const body = await response.json();
    const text = (body.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join(" ")
      .trim();

    return text || null;
  } catch (error) {
    console.warn(`Claude comment skipped: ${error.message}`);

    return null;
  }
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
  const lookbackHours = resolveLookbackHours(now, process.env.LOOKBACK_HOURS);
  const since = new Date(now.getTime() - lookbackHours * HOUR_MS);

  let blocks;

  try {
    const data = await collect({ repo, token, since });
    const auth = resolveAuth(process.env);

    if (auth?.notice) {
      console.warn(auth.notice);
    }

    const comment = auth ? await requestComment(auth, data) : null;

    blocks = buildBlocks(data, { repo, now, lookbackHours, comment });
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

  const text = "Podsumowanie GitHub przed daily";

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
