import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBlocks,
  escapeMrkdwn,
  formatAge,
  resolveLookbackHours,
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

test("Monday reaches back over the weekend", () => {
  assert.equal(resolveLookbackHours(new Date("2026-08-31T09:45:00Z")), 72);
  assert.equal(resolveLookbackHours(new Date("2026-08-28T09:45:00Z")), 24);
});

test("an explicit lookback overrides the weekday default", () => {
  assert.equal(
    resolveLookbackHours(new Date("2026-08-31T09:45:00Z"), "168"),
    168,
  );
  assert.equal(
    resolveLookbackHours(new Date("2026-08-28T09:45:00Z"), "nonsense"),
    24,
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
