import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cliPath = new URL("./wiki-lint.mjs", import.meta.url);

const concept = ({
  title,
  type = "Technical Flow",
  status = "verified",
  timestamp = "2026-07-01T00:00:00Z",
  sourceRefs = ["repo:README.md"],
  related,
}) => `---
type: "${type}"
title: "${title}"
description: "${title} description."
tags:
  - "flow"
status: "${status}"
timestamp: "${timestamp}"
source_refs:
${sourceRefs.map((ref) => `  - "${ref}"`).join("\n")}
---

# Content

${title} content.

# Related Notes

[Related](${related})
`;

async function createRepo() {
  const repoRoot = await mkdtemp(join(tmpdir(), "nimara-wiki-lint-"));
  const wikiRoot = join(repoRoot, "llm-wiki");

  await mkdir(wikiRoot, { recursive: true });
  await writeFile(join(repoRoot, "README.md"), "# Fixture\n");

  return { repoRoot, wikiRoot };
}

function runLint(repoRoot, ...extraArgs) {
  return spawnSync(
    process.execPath,
    [
      cliPath.pathname,
      "--repo-root",
      repoRoot,
      "--wiki-root",
      "llm-wiki",
      "--now",
      "2026-07-10T00:00:00Z",
      "--max-age-days",
      "90",
      ...extraArgs,
    ],
    { encoding: "utf8" },
  );
}

test("accepts a current, sourced, indexed and connected OKF bundle", async () => {
  const { repoRoot, wikiRoot } = await createRepo();

  try {
    await writeFile(
      join(wikiRoot, "index.md"),
      "# Concepts\n* [Alpha](Alpha.md) - Alpha.\n* [Beta](Beta.md) - Beta.\n",
    );
    await writeFile(join(wikiRoot, "log.md"), "# Directory Update Log\n");
    await writeFile(
      join(wikiRoot, "Alpha.md"),
      concept({ title: "Alpha", type: "Map of Content", related: "Beta.md" }),
    );
    await writeFile(
      join(wikiRoot, "Beta.md"),
      concept({ title: "Beta", related: "Alpha.md" }),
    );

    const result = runLint(repoRoot);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /Wiki lint passed: 2 concept documents/);
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});

test("reports frontmatter, index, links, freshness, sources, orphans and relations", async () => {
  const { repoRoot, wikiRoot } = await createRepo();

  try {
    await writeFile(
      join(wikiRoot, "index.md"),
      "# Concepts\n* [Missing](Missing.md) - Dangling entry.\n",
    );
    await writeFile(join(wikiRoot, "log.md"), "# Directory Update Log\n");
    await writeFile(
      join(wikiRoot, "Broken.md"),
      `---
title: "Broken"
description: "Broken fixture."
status: "verified"
timestamp: "2025-01-01T00:00:00Z"
---

# Content

[Dangling](Does%20Not%20Exist.md)
`,
    );

    const result = runLint(repoRoot);
    const output = result.stdout + result.stderr;

    assert.equal(result.status, 1, output);
    for (const category of [
      "FRONTMATTER",
      "INDEX_COVERAGE",
      "BROKEN_LINK",
      "STALE",
      "SOURCE",
      "ORPHAN",
      "RELATION",
    ]) {
      assert.match(output, new RegExp(`\\[${category}\\]`), output);
    }
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});

test("requires archived source material to carry provenance", async () => {
  const { repoRoot, wikiRoot } = await createRepo();

  try {
    await writeFile(
      join(wikiRoot, "index.md"),
      "# Sources\n* [Source](Source.md) - Source fixture.\n",
    );
    await writeFile(join(wikiRoot, "log.md"), "# Directory Update Log\n");
    await writeFile(
      join(wikiRoot, "Source.md"),
      `---
type: "Source Material"
title: "Source"
description: "Source without provenance."
timestamp: "2026-07-01T00:00:00Z"
---

# Content

Archived body.
`,
    );

    const result = runLint(repoRoot);
    const output = result.stdout + result.stderr;

    assert.equal(result.status, 1, output);
    assert.match(
      output,
      /\[SOURCE\].*Source\.md: source material requires resource metadata, a Provenance heading, or an external citation/,
    );
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});

test("requires a freshness date and a relationship inside Related Notes", async () => {
  const { repoRoot, wikiRoot } = await createRepo();

  try {
    await writeFile(
      join(wikiRoot, "index.md"),
      "# Concepts\n* [Flow](Flow.md) - Flow.\n* [MOC](MOC.md) - MOC.\n",
    );
    await writeFile(join(wikiRoot, "log.md"), "# Directory Update Log\n");
    await writeFile(
      join(wikiRoot, "MOC.md"),
      concept({ title: "MOC", type: "Map of Content", related: "Flow.md" }),
    );
    await writeFile(
      join(wikiRoot, "Flow.md"),
      `---
type: "Technical Flow"
title: "Flow"
description: "Flow fixture."
status: "draft"
required_relations:
  - "MOC.md"
---

# Related Notes

# Later Section

[MOC](MOC.md)
`,
    );

    const result = runLint(repoRoot);
    const output = result.stdout + result.stderr;

    assert.equal(result.status, 1, output);
    assert.match(output, /\[STALE\].*missing verified_at or timestamp/);
    assert.match(output, /\[RELATION\].*missing Related Notes section/);
    assert.match(output, /\[RELATION\].*required relation is missing/);
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});

test("detects edits to the body of an archived source", async () => {
  const { repoRoot, wikiRoot } = await createRepo();
  const sourcePath = join(wikiRoot, "Source.md");

  try {
    await writeFile(
      join(wikiRoot, "index.md"),
      "# Sources\n* [Source](Source.md) - Source fixture.\n",
    );
    await writeFile(join(wikiRoot, "log.md"), "# Directory Update Log\n");
    await writeFile(
      sourcePath,
      `---
type: "Source Material"
title: "Source"
description: "Immutable source fixture."
resource: "https://example.com/source"
timestamp: "2026-07-01T00:00:00Z"
content_sha256: "sha256:4030620775ee4ff1b17f9f7b604f7d7111a74c3fc8a997fef93bfad64e17b185"
---

# Content

Original body.
`,
    );

    for (const args of [
      ["init"],
      ["config", "user.email", "wiki@example.com"],
      ["config", "user.name", "Wiki Test"],
      ["add", "."],
      ["commit", "-m", "fixture"],
    ]) {
      const git = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
      assert.equal(git.status, 0, git.stdout + git.stderr);
    }

    await writeFile(
      sourcePath,
      `---
type: "Source Material"
title: "Source"
description: "Metadata may change."
resource: "https://example.com/source"
timestamp: "2026-07-10T00:00:00Z"
content_sha256: "sha256:502bd13a0f3bc71dab12accc0ec764820c5a3bc4b4d5fd14e11c97f067c1e41b"
---

# Content

Rewritten body.
`,
    );

    for (const args of [
      ["add", "."],
      ["commit", "-m", "rewrite source body"],
    ]) {
      const git = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
      assert.equal(git.status, 0, git.stdout + git.stderr);
    }

    const result = runLint(repoRoot);
    const output = result.stdout + result.stderr;

    assert.equal(result.status, 1, output);
    assert.match(
      output,
      /\[SOURCE\].*content_sha256 changed from immutable baseline/,
    );
  } finally {
    await rm(repoRoot, { force: true, recursive: true });
  }
});
