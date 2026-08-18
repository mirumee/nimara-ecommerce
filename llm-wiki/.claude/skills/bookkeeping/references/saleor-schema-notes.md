# Saleor schema notes

Curated notes on the Saleor GraphQL API live in `tech/saleor/` and are registered in
`tech/saleor/Saleor Schema (MOC).md`. They are the one record type carrying a freshness stamp,
because the project does not pin a Saleor version: it connects through
`NEXT_PUBLIC_SALEOR_API_URL`, and `pnpm codegen` fetches the schema live from that URL into
`packages/codegen/schema.ts`. That committed file is the de-facto pin, so a note can drift from the
schema the code actually talks to.

## Writing one

- Create from `_templates/saleor-schema-note.md`. The created note's `type` is
  `Saleor Schema Note`.
- Keep it curated and one idea per note, scoped to a domain — checkout, orders, account. It is not
  an auto-generated dump of every type in the schema.
- Beyond the base fields, the note carries `saleor_schema_hash` and `saleor_schema_generated`.

## Stamping

`saleor_schema_hash` is the short sha256 of `packages/codegen/schema.ts` the note was written
against:

```bash
pnpm wiki:saleor:hash     # prints the current stamp; paste it into the note
pnpm wiki:saleor:check    # compares every note against the current schema
```

`check` exits non-zero when any note is `STALE`, and prints `OK`, `STALE`, or `unstamped` per note.

## Reading a STALE result

`STALE` means the note was written against a different schema, not that it is wrong. It becomes
expected the moment `pnpm codegen` regenerates `packages/codegen/schema.ts`. The stamp covers the
whole schema, so any regeneration flags every note at once — a deliberately blunt gate, chosen over
per-type tracking that would need its own machinery.

Clearing it is a review, not a restamp: read the note against the current
`packages/codegen/schema.ts`, correct whatever moved, and only then take a new stamp. Restamping an
unread note converts a known-stale claim into an unknown-stale one.

Nothing runs `check` automatically. A note may sit `STALE` for weeks without a signal, which is why
the `explore` skill runs it before citing one.
