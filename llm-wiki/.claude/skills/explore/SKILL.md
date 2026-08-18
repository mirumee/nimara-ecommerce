---
name: explore
description: Ways to explore llm-wiki and answer from it. Use when the user asks to find, explain, compare, or cite anything the wiki already holds — product state, flows, integrations, operations, PRDs, RFCs, ADRs, implementation evidence, strategy, personas, QA knowledge, or source notes. Read-only: it never writes to the wiki.
---

# Explore

Three ways in, in the order that usually costs least, and a fourth for moving between records
once you are already holding one. Read-only throughout: this skill answers questions and cites
files.

## 1. The router

`llm-wiki/index.md` lists every note once, grouped by record type, with a one-line hook. Start
here when you know roughly what kind of thing you are after. It is the only file guaranteed to
mention everything.

## 2. Crosslinks

Concepts here reference each other with ordinary Markdown links.
Once you hold one record, following its links is cheaper than searching again: its neighbourhood is already declared.

## 3. Semantic search

`qmd` is a local index over the same Markdown. Reach for it when the question is a phrase rather
than a location, and you do not know which record would hold the answer.

Read `references/semantic-search.md` before using it. It covers checking that the index describes
this checkout — a stale one silently answers about another worktree — plus which of `query`,
`search`, and `get` fits, and the failure modes that make a miss look like an absence.

## 4. Plain search

Grep and glob still beat everything for an exact token: a record ID, a field name, a commit SHA,
an env var. The tree is 90-odd files; reading three of them in full is often cheaper than one
semantic round trip.

Start from [index.md](../../../index.md).
