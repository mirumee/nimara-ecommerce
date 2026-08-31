import assert from "node:assert/strict";
import test from "node:test";

import {
  ageBucket,
  buildBlocks,
  classifyOpenPullRequests,
  dependabotSection,
  escapeMrkdwn,
  formatAge,
  markDependabotState,
  readComment,
  resolveWindow,
  summarizeBumpedFiles,
  summarizeDependabotForPrompt,
  summarizeForPrompt,
  workspaceBreakdown,
} from "./daily-summary.mjs";

const NOW = new Date("2026-08-28T09:45:00Z");
const CONTEXT = {
  repo: "mirumee/nimara-ecommerce",
  now: NOW,
  lookbackHours: 24,
};

const EMPTY = {
  merged: [],
  blockedOnAuthor: [],
  unclaimed: [],
  readyToMerge: [],
  failedRuns: [],
  openedIssues: [],
  closedIssues: [],
  releases: [],
  dependabot: [],
  dependabotMergedCount: 0,
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

function daysAgo(days) {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function textOf(blocks) {
  return blocks
    .map((block) => block.text?.text ?? block.elements?.[0]?.text ?? "")
    .join("\n");
}

test("Monday recaps the whole previous week", () => {
  const monday = resolveWindow(new Date("2026-08-31T09:45:00Z"));

  assert.equal(monday.lookbackHours, 168);
  assert.equal(monday.weekly, true);
});

test("every other weekday reports since the last daily", () => {
  const friday = resolveWindow(NOW);

  assert.equal(friday.lookbackHours, 24);
  assert.equal(friday.weekly, false);
});

test("an override changes the window but not the shape of the message", () => {
  const monday = resolveWindow(new Date("2026-08-31T09:45:00Z"), "2");

  assert.equal(monday.lookbackHours, 2);
  assert.equal(monday.weekly, true);
});

test("mrkdwn control characters in a title cannot break a link", () => {
  assert.equal(
    escapeMrkdwn("fix: <a> & <b>"),
    "fix: &lt;a&gt; &amp; &lt;b&gt;",
  );
});

test("age reads in hours below a day and in days above it", () => {
  assert.equal(formatAge(daysAgo(0.2), NOW), "4 godz.");
  assert.equal(formatAge(daysAgo(1), NOW), "1 dzień");
  assert.equal(formatAge(daysAgo(7), NOW), "7 dni");
});

test("age buckets follow the two thresholds", () => {
  assert.equal(ageBucket(daysAgo(1), NOW), "fresh");
  assert.equal(ageBucket(daysAgo(2), NOW), "warn");
  assert.equal(ageBucket(daysAgo(4), NOW), "warn");
  assert.equal(ageBucket(daysAgo(5), NOW), "parked");
});

test("a red build puts the ball with the author, even when approved", () => {
  const failing = pullRequest({ number: 10 });
  const result = classifyOpenPullRequests({
    unreviewed: [],
    changesRequested: [],
    failingChecks: [failing],
    approved: [failing],
  });

  assert.equal(result.blockedOnAuthor.length, 1);
  assert.equal(result.blockedOnAuthor[0].reason, "CI czerwone");
  assert.deepEqual(result.readyToMerge, []);
});

test("a requested change puts the ball with the author", () => {
  const result = classifyOpenPullRequests({
    unreviewed: [pullRequest({ number: 11 })],
    changesRequested: [pullRequest({ number: 11 })],
    failingChecks: [],
    approved: [],
  });

  assert.equal(result.blockedOnAuthor[0].reason, "zmiany do poprawy");
  assert.deepEqual(result.unclaimed, []);
});

test("a red build outranks a requested change as the reason", () => {
  const both = pullRequest({ number: 12 });
  const result = classifyOpenPullRequests({
    unreviewed: [],
    changesRequested: [both],
    failingChecks: [both],
    approved: [],
  });

  assert.equal(result.blockedOnAuthor.length, 1);
  assert.equal(result.blockedOnAuthor[0].reason, "CI czerwone");
});

test("an untouched pull request stays unclaimed and a clean approval stays ready", () => {
  const result = classifyOpenPullRequests({
    unreviewed: [pullRequest({ number: 13 })],
    changesRequested: [],
    failingChecks: [],
    approved: [pullRequest({ number: 14 })],
  });

  assert.equal(result.unclaimed[0].number, 13);
  assert.equal(result.readyToMerge[0].number, 14);
});

test("red CI on main leads the message", () => {
  const blocks = buildBlocks(
    {
      ...EMPTY,
      failedRuns: [
        {
          name: "Linters & Tests",
          html_url:
            "https://github.com/mirumee/nimara-ecommerce/actions/runs/1",
          head_commit: { message: "fix: a thing\n\nbody" },
        },
      ],
      readyToMerge: [pullRequest()],
    },
    CONTEXT,
  );

  assert.match(blocks[2].text.text, /Blokuje wszystkich/);
  assert.match(blocks[3].text.text, /Jeden klik do merge/);
});

test("the sections follow the owner of the next move", () => {
  const text = textOf(
    buildBlocks(
      {
        ...EMPTY,
        blockedOnAuthor: [pullRequest({ number: 20, reason: "CI czerwone" })],
        unclaimed: [pullRequest({ number: 21 })],
        readyToMerge: [pullRequest({ number: 22 })],
      },
      CONTEXT,
    ),
  );

  assert.match(text, /Czeka na autora \(1\)/);
  assert.match(text, /Nikt nie wziął \(1\)/);
  assert.match(text, /Jeden klik do merge \(1\)/);
  assert.match(text, /#20 feat: something.*CI czerwone/);
});

test("a parked pull request is counted on a weekday, not listed", () => {
  const blocks = buildBlocks(
    { ...EMPTY, unclaimed: [pullRequest({ created_at: daysAgo(41) })] },
    CONTEXT,
  );
  const text = textOf(blocks);

  assert.doesNotMatch(text, /Nikt nie wziął/);
  assert.match(text, /odstawione: 1/);
});

test("Monday lists the parked pull requests instead of counting them", () => {
  const text = textOf(
    buildBlocks(
      { ...EMPTY, unclaimed: [pullRequest({ created_at: daysAgo(41) })] },
      { ...CONTEXT, weekly: true },
    ),
  );

  assert.match(text, /Nikt nie wziął \(1\)/);
  assert.doesNotMatch(text, /odstawione/);
});

test("a pull request past the warn threshold carries a marker", () => {
  const text = textOf(
    buildBlocks(
      { ...EMPTY, unclaimed: [pullRequest({ created_at: daysAgo(3) })] },
      CONTEXT,
    ),
  );

  assert.match(text, /:small_red_triangle:/);
  assert.doesNotMatch(
    textOf(buildBlocks({ ...EMPTY, unclaimed: [pullRequest()] }, CONTEXT)),
    /:small_red_triangle:/,
  );
});

test("merged pull requests reach the background line, not a section", () => {
  const blocks = buildBlocks(
    {
      ...EMPTY,
      merged: [pullRequest(), pullRequest()],
      releases: [
        {
          tag_name: "v1.0.0",
          html_url: "https://github.com/x/y/releases/tag/v1.0.0",
        },
      ],
    },
    CONTEXT,
  );
  const background = blocks.at(-1);

  assert.equal(background.type, "context");
  assert.match(background.elements[0].text, /2 PR-ów zmergowanych/);
  assert.match(background.elements[0].text, /v1\.0\.0/);
  assert.doesNotMatch(textOf(blocks.slice(0, -1)), /Zmergowane/);
});

test("a quiet repository says so and still carries the background line", () => {
  const blocks = buildBlocks(EMPTY, CONTEXT);

  assert.match(textOf(blocks), /Nic nie czeka na ruch/);
  assert.equal(blocks.at(-1).elements[0].text, "bez zmian w tle");
});

test("a Claude comment sits above the sections", () => {
  const blocks = buildBlocks(
    { ...EMPTY, readyToMerge: [pullRequest()] },
    { ...CONTEXT, comment: "Dwa PR-y czekają na klik." },
  );

  assert.match(blocks[2].text.text, /Dwa PR-y czekają/);
  assert.match(blocks[3].text.text, /Jeden klik do merge/);
});

test("a comment with mrkdwn control characters cannot break the message", () => {
  const blocks = buildBlocks(EMPTY, {
    ...CONTEXT,
    comment: "Uwaga na <b> & spółkę",
  });

  assert.match(textOf(blocks), /Uwaga na &lt;b&gt; &amp; spółkę/);
});

test("a long list is truncated and reports the remainder", () => {
  const many = Array.from({ length: 14 }, (_, index) =>
    pullRequest({ number: index + 1 }),
  );
  const text = textOf(buildBlocks({ ...EMPTY, unclaimed: many }, CONTEXT));

  assert.match(text, /Nikt nie wziął \(14\)/);
  assert.match(text, /…i 4 więcej/);
});

test("a section stays inside the Slack text limit", () => {
  const many = Array.from({ length: 200 }, (_, index) =>
    pullRequest({ number: index, title: "x".repeat(300) }),
  );

  for (const block of buildBlocks({ ...EMPTY, unclaimed: many }, CONTEXT)) {
    assert.ok((block.text?.text ?? "").length <= 3000);
  }
});

test("the prompt payload mirrors the sections", () => {
  const payload = summarizeForPrompt(
    {
      ...EMPTY,
      failedRuns: [{ name: "Linters & Tests" }],
      blockedOnAuthor: [
        pullRequest({
          number: 30,
          reason: "CI czerwone",
          created_at: daysAgo(3),
        }),
      ],
      unclaimed: [
        pullRequest({ number: 31, body: "Zmienia liczenie rabatu." }),
      ],
      readyToMerge: [pullRequest({ number: 32 })],
      merged: [pullRequest({ number: 33 })],
      releases: [{ tag_name: "v1.2.3" }],
    },
    { now: NOW },
  );

  assert.deepEqual(payload.redCiOnMain, ["Linters & Tests"]);
  assert.equal(payload.blockedOnAuthor[0].reason, "CI czerwone");
  assert.equal(payload.blockedOnAuthor[0].ageDays, 3);
  assert.equal(payload.blockedOnAuthor[0].author, "someone");
  assert.equal(payload.unclaimed[0].description, "Zmienia liczenie rabatu.");
  assert.deepEqual(payload.readyToMerge, [
    { title: "feat: something", author: "someone" },
  ]);
  assert.equal(payload.mergedCount, 1);
  assert.deepEqual(payload.releases, ["v1.2.3"]);
});

test("a long description is truncated and an empty one becomes null", () => {
  const payload = summarizeForPrompt(
    {
      ...EMPTY,
      unclaimed: [
        pullRequest({ body: "x".repeat(2000) }),
        pullRequest({ body: "   " }),
      ],
    },
    { now: NOW },
  );

  assert.equal(payload.unclaimed[0].description.length, 600);
  assert.equal(payload.unclaimed[1].description, null);
});

test("the prompt payload names the window", () => {
  assert.equal(summarizeForPrompt(EMPTY, { weekly: true }).window, "lastWeek");
  assert.equal(summarizeForPrompt(EMPTY).window, "sinceLastDaily");
});

test("a successful envelope yields the comment", () => {
  const comment = readComment(
    JSON.stringify({
      subtype: "success",
      is_error: false,
      result: "  Spokojnie.  ",
    }),
  );

  assert.equal(comment, "Spokojnie.");
});

test("an envelope that reports an error yields no comment", () => {
  assert.equal(
    readComment(
      JSON.stringify({ subtype: "error_during_execution", is_error: true }),
    ),
    null,
  );
});

test("a successful envelope with an empty result yields no comment", () => {
  assert.equal(
    readComment(
      JSON.stringify({ subtype: "success", is_error: false, result: "   " }),
    ),
    null,
  );
});

test("output that is not JSON yields no comment", () => {
  assert.equal(readComment("command not found: claude"), null);
});

test("the background line caps the release list", () => {
  const releases = Array.from({ length: 5 }, (_, index) => ({
    tag_name: `v1.0.${index}`,
    html_url: `https://github.com/x/y/releases/tag/v1.0.${index}`,
  }));
  const background = buildBlocks({ ...EMPTY, releases }, CONTEXT).at(-1);

  assert.match(background.elements[0].text, /v1\.0\.0/);
  assert.match(background.elements[0].text, /v1\.0\.1/);
  assert.doesNotMatch(background.elements[0].text, /v1\.0\.2/);
  assert.match(background.elements[0].text, /\+3 release/);
});

test("the prompt payload hides parked entries from the queues but names them apart", () => {
  const payload = summarizeForPrompt(
    {
      ...EMPTY,
      unclaimed: [
        pullRequest({ number: 40, created_at: daysAgo(1) }),
        pullRequest({ number: 41, created_at: daysAgo(41) }),
      ],
    },
    { now: NOW },
  );

  assert.equal(payload.unclaimed.length, 1);
  assert.equal(payload.parked.length, 1);
  assert.equal(payload.parked[0].ageDays, 41);
});

test("Monday keeps the parked entries in the queues and sends none apart", () => {
  const payload = summarizeForPrompt(
    { ...EMPTY, unclaimed: [pullRequest({ created_at: daysAgo(41) })] },
    { now: NOW, weekly: true },
  );

  assert.equal(payload.unclaimed.length, 1);
  assert.deepEqual(payload.parked, []);
});

test("an overlong comment is cut so the Slack block still fits", () => {
  const comment = readComment(
    JSON.stringify({
      subtype: "success",
      is_error: false,
      result: "z".repeat(5000),
    }),
  );

  assert.equal(comment.length, 1200);
});

function bump(overrides) {
  return pullRequest({
    number: 812,
    title: "chore(deps): bump the production-dependencies group",
    user: { login: "dependabot[bot]" },
    ci: null,
    approved: false,
    ...overrides,
  });
}

test("a bump carries the state the two searches already know", () => {
  const items = markDependabotState(
    [bump({ number: 50 }), bump({ number: 51 }), bump({ number: 52 })],
    {
      failingChecks: [pullRequest({ number: 51 })],
      approved: [pullRequest({ number: 52 })],
    },
  );

  assert.deepEqual(
    items.map((item) => [item.ci, item.approved]),
    [
      [null, false],
      ["red", false],
      [null, true],
    ],
  );
});

test("the dependabot section names the state instead of the bot author", () => {
  const text = textOf(
    buildBlocks(
      {
        ...EMPTY,
        dependabot: [
          bump({ number: 60, approved: true }),
          bump({ number: 61, ci: "red" }),
        ],
      },
      CONTEXT,
    ),
  );

  assert.match(text, /Dependabot \(2\)/);
  assert.match(text, /#60 .*zatwierdzony/);
  assert.match(text, /#61 .*CI czerwone/);
  assert.doesNotMatch(text, /dependabot\[bot\]/);
});

test("no open bump means no dependabot section", () => {
  assert.doesNotMatch(textOf(buildBlocks(EMPTY, CONTEXT)), /Dependabot/);
  assert.equal(dependabotSection([], NOW, "cokolwiek"), null);
});

test("the dependabot comment sits under the header, above the list", () => {
  const block = dependabotSection([bump({ number: 62 })], NOW, "Jeden bump.");
  const lines = block.text.text.split("\n");

  assert.match(lines[0], /Dependabot \(1\)/);
  assert.equal(lines[1], "_Jeden bump._");
  assert.match(lines[2], /#62/);
});

test("a dependabot comment with mrkdwn control characters cannot break the block", () => {
  const block = dependabotSection([bump()], NOW, "next & <b>");

  assert.match(block.text.text, /next &amp; &lt;b&gt;/);
});

test("an old bump is listed on a weekday rather than counted as parked", () => {
  const blocks = buildBlocks(
    { ...EMPTY, dependabot: [bump({ created_at: daysAgo(9) })] },
    CONTEXT,
  );
  const text = textOf(blocks);

  assert.match(text, /Dependabot \(1\)/);
  assert.match(text, /:small_red_triangle:/);
  assert.doesNotMatch(text, /odstawione/);
});

test("the dependabot section stays inside the Slack text limit", () => {
  const many = Array.from({ length: 200 }, (_, index) =>
    bump({ number: index, title: "x".repeat(300) }),
  );
  const block = dependabotSection(many, NOW, "z".repeat(400));

  assert.ok(block.text.text.length <= 3000);
});

test("only bumps reach the dependabot section and the message shows no duplicate", () => {
  const text = textOf(
    buildBlocks(
      {
        ...EMPTY,
        unclaimed: [pullRequest({ number: 70 })],
        dependabot: [bump({ number: 71 })],
      },
      CONTEXT,
    ),
  );

  assert.match(text, /Nikt nie wziął \(1\)/);
  assert.match(text, /Dependabot \(1\)/);
  assert.equal(text.match(/#71/g).length, 1);
});

test("the dependabot payload carries state, age, and what already merged", () => {
  const payload = summarizeDependabotForPrompt(
    {
      ...EMPTY,
      dependabot: [
        bump({ number: 80, ci: "red", created_at: daysAgo(6) }),
        bump({ number: 81, approved: true }),
      ],
      dependabotMergedCount: 4,
    },
    { now: NOW },
  );

  assert.equal(payload.window, "sinceLastDaily");
  assert.equal(payload.open[0].ci, "red");
  assert.equal(payload.open[0].ageDays, 6);
  assert.equal(payload.open[1].approved, true);
  assert.equal(payload.mergedCount, 4);
});

test("the dependabot payload names the weekly window and survives empty data", () => {
  assert.deepEqual(summarizeDependabotForPrompt(EMPTY, { weekly: true }), {
    window: "lastWeek",
    open: [],
    mergedCount: 0,
  });
});

test("the dependabot comment is cut shorter than the main one", () => {
  const envelope = JSON.stringify({
    subtype: "success",
    is_error: false,
    result: "z".repeat(5000),
  });

  assert.equal(readComment(envelope, 400).length, 400);
  assert.equal(readComment(envelope).length, 1200);
});

function manifest(filename, lines) {
  return { filename, patch: ["@@ -1,5 +1,5 @@", ...lines].join("\n") };
}

function detailOf(workspaces, catalog = []) {
  return {
    workspaces: workspaces.map(([name, count]) => ({
      name,
      bumps: Array.from({ length: count }, (_, index) => ({
        name: `pkg-${index}`,
        from: "1.0.0",
        to: "1.1.0",
      })),
    })),
    catalog: catalog.map((name) => ({ name, from: "1.0.0", to: "1.1.0" })),
  };
}

test("a manifest patch yields the workspace and its version changes", () => {
  const detail = summarizeBumpedFiles([
    manifest("apps/storefront/package.json", [
      '-    "@sentry/nextjs": "^10.70.0",',
      '+    "@sentry/nextjs": "^10.71.0",',
      '     "@nimara/ui": "workspace:*",',
      '-    "next-intl": "^4.13.7",',
      '+    "next-intl": "^4.14.1",',
    ]),
  ]);

  assert.equal(detail.workspaces.length, 1);
  assert.equal(detail.workspaces[0].name, "apps/storefront");
  assert.deepEqual(detail.workspaces[0].bumps, [
    { name: "@sentry/nextjs", from: "^10.70.0", to: "^10.71.0" },
    { name: "next-intl", from: "^4.13.7", to: "^4.14.1" },
  ]);
});

test("the catalog is read from the workspace file, not from a workspace", () => {
  const detail = summarizeBumpedFiles([
    manifest("pnpm-workspace.yaml", [
      '   - "apps/*"',
      "-  hono: 4.13.3",
      "-  next: 16.3.2",
      "+  hono: 4.13.5",
      "+  next: 16.3.3",
    ]),
  ]);

  assert.deepEqual(detail.workspaces, []);
  assert.deepEqual(detail.catalog, [
    { name: "hono", from: "4.13.3", to: "4.13.5" },
    { name: "next", from: "16.3.2", to: "16.3.3" },
  ]);
});

test("a pointer is not a version and the lockfile is not a workspace", () => {
  const detail = summarizeBumpedFiles([
    manifest("apps/storefront/package.json", [
      '-    "next": "16.3.2",',
      '+    "next": "catalog:",',
      '-    "@nimara/ui": "1.0.0",',
      '+    "@nimara/ui": "workspace:*",',
    ]),
    manifest("pnpm-lock.yaml", ["-  next: 16.3.2", "+  next: 16.3.3"]),
    { filename: "packages/ui/package.json" },
  ]);

  assert.deepEqual(detail.workspaces, []);
  assert.deepEqual(detail.catalog, []);
});

test("the root manifest is named apart from the workspaces", () => {
  const detail = summarizeBumpedFiles([
    manifest("package.json", [
      '-    "turbo": "2.0.0",',
      '+    "turbo": "2.1.0",',
    ]),
  ]);

  assert.deepEqual(detail.workspaces, [
    {
      name: "root",
      bumps: [{ name: "turbo", from: "2.0.0", to: "2.1.0" }],
    },
  ]);
});

test("the breakdown splits apps from packages and ranks by bump count", () => {
  const text = workspaceBreakdown(
    detailOf(
      [
        ["apps/stripe", 1],
        ["apps/storefront", 6],
        ["packages/ui", 2],
      ],
      ["next"],
    ),
  );

  assert.equal(
    text,
    "apps: storefront (6), stripe (1) · packages: ui (2) · catalog: next",
  );
});

test("the breakdown counts the workspaces it cannot fit", () => {
  const text = workspaceBreakdown(
    detailOf([
      ["packages/a", 5],
      ["packages/b", 4],
      ["packages/c", 3],
      ["packages/d", 2],
      ["packages/e", 1],
      ["packages/f", 1],
    ]),
  );

  assert.match(text, /packages: a \(5\), b \(4\), c \(3\), d \(2\), \+2$/);
});

test("a bump with no detail renders one line and no breakdown", () => {
  assert.equal(workspaceBreakdown(undefined), "");
  assert.equal(workspaceBreakdown(detailOf([])), "");

  const block = dependabotSection([bump({ number: 90 })], NOW, null);

  assert.equal(block.text.text.split("\n").length, 2);
});

test("the breakdown sits under its own bump and cannot break the message", () => {
  const block = dependabotSection(
    [bump({ number: 91, detail: detailOf([["apps/storefront", 2]], ["a&b"]) })],
    NOW,
    null,
  );
  const lines = block.text.text.split("\n");

  assert.match(lines[1], /#91/);
  assert.match(lines[2], /↳ _apps: storefront \(2\) · catalog: a&amp;b_/);
});

test("the prompt payload carries the workspaces, the catalog, and distinct bumps", () => {
  const payload = summarizeDependabotForPrompt(
    {
      ...EMPTY,
      dependabot: [
        bump({
          number: 92,
          detail: {
            workspaces: [
              {
                name: "apps/storefront",
                bumps: [{ name: "next-intl", from: "^4.13.7", to: "^4.14.1" }],
              },
              {
                name: "packages/ui",
                bumps: [{ name: "next-intl", from: "^4.13.7", to: "^4.14.1" }],
              },
            ],
            catalog: [{ name: "next", from: "16.3.2", to: "16.3.3" }],
          },
        }),
      ],
    },
    { now: NOW },
  );

  assert.deepEqual(payload.open[0].workspaces, [
    { name: "apps/storefront", count: 1 },
    { name: "packages/ui", count: 1 },
  ]);
  assert.deepEqual(payload.open[0].catalog, ["next"]);
  assert.deepEqual(payload.open[0].bumps, [
    { name: "next-intl", from: "^4.13.7", to: "^4.14.1" },
    { name: "next", from: "16.3.2", to: "16.3.3" },
  ]);
});
