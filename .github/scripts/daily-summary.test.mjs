import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBlocks,
  escapeMrkdwn,
  formatAge,
  resolveAuth,
  resolveWindow,
  summarizeForPrompt,
} from "./daily-summary.mjs";

const NOW = new Date("2026-08-28T09:45:00Z");
const CONTEXT = {
  repo: "mirumee/nimara-ecommerce",
  now: NOW,
  lookbackHours: 24,
};

const EMPTY = {
  merged: [],
  toReview: [],
  approved: [],
  failedRuns: [],
  openedIssues: [],
  closedIssues: [],
  releases: [],
};

function pullRequest(overrides) {
  return {
    number: 1,
    title: "feat: something",
    html_url: "https://github.com/mirumee/nimara-ecommerce/pull/1",
    user: { login: "someone" },
    created_at: "2026-08-28T08:45:00Z",
    ...overrides,
  };
}

function textOf(blocks) {
  return blocks.map((block) => block.text?.text ?? "").join("\n");
}

test("Monday recaps the whole previous week", () => {
  const monday = resolveWindow(new Date("2026-08-31T09:45:00Z"));

  assert.equal(monday.lookbackHours, 168);
  assert.equal(monday.weekly, true);
});

test("every other weekday reports since the last daily", () => {
  const friday = resolveWindow(new Date("2026-08-28T09:45:00Z"));

  assert.equal(friday.lookbackHours, 24);
  assert.equal(friday.weekly, false);
});

test("an override changes the window but not the shape of the message", () => {
  const monday = resolveWindow(new Date("2026-08-31T09:45:00Z"), "2");

  assert.equal(monday.lookbackHours, 2);
  assert.equal(monday.weekly, true);
  assert.equal(
    resolveWindow(new Date("2026-08-28T09:45:00Z"), "junk").lookbackHours,
    24,
  );
});

test("Monday carries a different heading", () => {
  const weekly = buildBlocks(EMPTY, { ...CONTEXT, weekly: true });

  assert.equal(weekly[0].text.text, "Podsumowanie zeszłego tygodnia");
  assert.equal(
    buildBlocks(EMPTY, CONTEXT)[0].text.text,
    "Podsumowanie GitHub przed daily",
  );
});

test("mrkdwn control characters in a title cannot break a link", () => {
  assert.equal(
    escapeMrkdwn("fix: <a> & <b>"),
    "fix: &lt;a&gt; &amp; &lt;b&gt;",
  );
});

test("age reads in hours below a day and in days above it", () => {
  assert.equal(formatAge("2026-08-28T04:45:00Z", NOW), "5 godz.");
  assert.equal(formatAge("2026-08-27T09:45:00Z", NOW), "1 dzień");
  assert.equal(formatAge("2026-08-21T09:45:00Z", NOW), "7 dni");
});

test("a quiet repository still produces a message", () => {
  const blocks = buildBlocks(EMPTY, CONTEXT);

  assert.equal(blocks.length, 3);
  assert.match(textOf(blocks), /Brak ruchu/);
});

test("a pull request older than two days is marked stale", () => {
  const blocks = buildBlocks(
    {
      ...EMPTY,
      toReview: [pullRequest({ created_at: "2026-08-20T09:45:00Z" })],
    },
    CONTEXT,
  );

  assert.match(textOf(blocks), /:hourglass:/);
});

test("a fresh pull request is not marked stale", () => {
  const blocks = buildBlocks({ ...EMPTY, toReview: [pullRequest()] }, CONTEXT);

  assert.doesNotMatch(textOf(blocks), /:hourglass:/);
});

test("a merged pull request carries no age marker", () => {
  const blocks = buildBlocks(
    { ...EMPTY, merged: [pullRequest({ created_at: "2026-06-01T09:45:00Z" })] },
    CONTEXT,
  );

  assert.doesNotMatch(textOf(blocks), /:hourglass:/);
});

test("a long list is truncated and reports the remainder", () => {
  const many = Array.from({ length: 14 }, (_, index) =>
    pullRequest({ number: index + 1 }),
  );
  const text = textOf(buildBlocks({ ...EMPTY, merged: many }, CONTEXT));

  assert.match(text, /Zmergowane do main \(14\)/);
  assert.match(text, /…i 4 więcej/);
});

test("every section renders when data is present", () => {
  const blocks = buildBlocks(
    {
      merged: [pullRequest({ number: 10 })],
      toReview: [pullRequest({ number: 11 })],
      approved: [pullRequest({ number: 12 })],
      failedRuns: [
        {
          name: "Linters & Tests",
          html_url:
            "https://github.com/mirumee/nimara-ecommerce/actions/runs/1",
          head_commit: { message: "fix: a thing\n\nbody" },
        },
      ],
      openedIssues: [{}],
      closedIssues: [{}, {}],
      releases: [
        {
          tag_name: "v1.0.0",
          html_url:
            "https://github.com/mirumee/nimara-ecommerce/releases/tag/v1.0.0",
        },
      ],
    },
    CONTEXT,
  );
  const text = textOf(blocks);

  assert.equal(blocks.length, 7);
  assert.match(text, /Linters &amp; Tests/);
  assert.doesNotMatch(text, /body/);
  assert.match(text, /Nowe issues: 1/);
  assert.match(text, /Zamknięte issues: 2/);
  assert.match(text, /v1\.0\.0/);
});

test("a section stays inside the Slack text limit", () => {
  const many = Array.from({ length: 200 }, (_, index) =>
    pullRequest({ number: index, title: "x".repeat(300) }),
  );

  for (const block of buildBlocks({ ...EMPTY, merged: many }, CONTEXT)) {
    assert.ok((block.text?.text ?? "").length <= 3000);
  }
});

test("a Claude comment sits above the sections", () => {
  const blocks = buildBlocks(
    { ...EMPTY, merged: [pullRequest()] },
    {
      ...CONTEXT,
      comment: "Dwa PR-y czekają na review dłużej niż dwa tygodnie.",
    },
  );

  assert.match(blocks[2].text.text, /Dwa PR-y czekają/);
  assert.match(blocks[3].text.text, /Zmergowane do main/);
});

test("a comment does not suppress the quiet message", () => {
  const blocks = buildBlocks(EMPTY, { ...CONTEXT, comment: "Spokojny dzień." });
  const text = textOf(blocks);

  assert.match(text, /Spokojny dzień/);
  assert.match(text, /Brak ruchu/);
});

test("no comment leaves the block layout unchanged", () => {
  assert.equal(buildBlocks(EMPTY, CONTEXT).length, 3);
});

test("a comment with mrkdwn control characters cannot break the message", () => {
  const blocks = buildBlocks(EMPTY, {
    ...CONTEXT,
    comment: "Uwaga na <b> & spółkę",
  });

  assert.match(textOf(blocks), /Uwaga na &lt;b&gt; &amp; spółkę/);
});

test("the prompt payload carries titles and counts, not whole API objects", () => {
  const payload = summarizeForPrompt({
    ...EMPTY,
    merged: [pullRequest({ title: "feat: a" })],
    toReview: [
      pullRequest({ title: "fix: b", created_at: "2026-08-01T00:00:00Z" }),
    ],
    openedIssues: [{}, {}],
    releases: [{ tag_name: "v1.2.3" }],
  });

  assert.deepEqual(payload.merged, [{ title: "feat: a", description: null }]);
  assert.deepEqual(payload.awaitingReview, [
    { title: "fix: b", description: null, createdAt: "2026-08-01T00:00:00Z" },
  ]);
  assert.equal(payload.openedIssues, 2);
  assert.deepEqual(payload.releases, ["v1.2.3"]);
});

test("the prompt payload caps each list at ten entries", () => {
  const many = Array.from({ length: 40 }, (_, index) =>
    pullRequest({ number: index }),
  );
  const payload = summarizeForPrompt({
    ...EMPTY,
    merged: many,
    toReview: many,
  });

  assert.equal(payload.merged.length, 10);
  assert.equal(payload.awaitingReview.length, 10);
});

test("no credential means no request", () => {
  assert.equal(resolveAuth({}), null);
});

test("an API key authenticates on x-api-key", () => {
  const auth = resolveAuth({ ANTHROPIC_API_KEY: "sk-ant-api03-abc" });

  assert.equal(auth.headers["x-api-key"], "sk-ant-api03-abc");
  assert.equal(auth.headers.authorization, undefined);
  assert.equal(auth.notice, undefined);
});

test("a subscription token authenticates as a bearer token", () => {
  const auth = resolveAuth({ CLAUDE_CODE_OAUTH_TOKEN: "sk-ant-oat01-abc" });

  assert.equal(auth.headers.authorization, "Bearer sk-ant-oat01-abc");
  assert.equal(auth.headers["anthropic-beta"], "oauth-2025-04-20");
  assert.equal(auth.headers["x-api-key"], undefined);
});

test("a subscription token under the API key name still works, with a notice", () => {
  const auth = resolveAuth({ ANTHROPIC_API_KEY: "sk-ant-oat01-abc" });

  assert.equal(auth.headers.authorization, "Bearer sk-ant-oat01-abc");
  assert.match(auth.notice, /CLAUDE_CODE_OAUTH_TOKEN/);
});

test("the subscription token wins when both are set", () => {
  const auth = resolveAuth({
    ANTHROPIC_API_KEY: "sk-ant-api03-abc",
    CLAUDE_CODE_OAUTH_TOKEN: "sk-ant-oat01-xyz",
  });

  assert.equal(auth.headers.authorization, "Bearer sk-ant-oat01-xyz");
});

test("the prompt payload carries the pull request description", () => {
  const payload = summarizeForPrompt({
    ...EMPTY,
    merged: [pullRequest({ body: "Zmienia sposób liczenia rabatu." })],
  });

  assert.equal(
    payload.merged[0].description,
    "Zmienia sposób liczenia rabatu.",
  );
});

test("a long description is truncated and an empty one becomes null", () => {
  const payload = summarizeForPrompt({
    ...EMPTY,
    merged: [
      pullRequest({ body: "x".repeat(2000) }),
      pullRequest({ body: "   " }),
    ],
  });

  assert.equal(payload.merged[0].description.length, 600);
  assert.equal(payload.merged[1].description, null);
});

test("the prompt payload names the window", () => {
  assert.equal(summarizeForPrompt(EMPTY, { weekly: true }).window, "lastWeek");
  assert.equal(summarizeForPrompt(EMPTY).window, "sinceLastDaily");
});
