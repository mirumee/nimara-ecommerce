/**
 * Mark Drizzle migrations as applied without running their SQL.
 *
 * Use this on existing dev/stage/prod databases that already have the
 * ledger schema created by the legacy `001_init_ledger.sql` migration.
 * After running this script, `pnpm --filter marketplace db:migrate` will
 * see migration(s) already in `__drizzle_migrations` and skip them.
 *
 * Uses drizzle-orm/migrator's `readMigrationFiles` to compute hashes the
 * same way `migrate()` does, so the values are guaranteed to match.
 *
 * Usage:
 *   DATABASE_URL=postgres://... pnpm --filter marketplace db:mark-baseline-applied
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readMigrationFiles } from "drizzle-orm/migrator";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationsFolder = join(__dirname, "../db/drizzle");
const migrations = readMigrationFiles({
  migrationsFolder,
  migrationsTable: "__drizzle_migrations",
  migrationsSchema: "public",
});

if (migrations.length === 0) {
  console.warn(`No migrations found in ${migrationsFolder}`);
  process.exit(0);
}

const client = new pg.Client({ connectionString });

await client.connect();

try {
  await client.query(`
    create schema if not exists "public";
  `);
  await client.query(`
    create table if not exists "public"."__drizzle_migrations" (
      id serial primary key,
      hash text not null,
      created_at bigint
    );
  `);

  for (const migration of migrations) {
    const { hash, folderMillis } = migration;
    const existing = await client.query(
      `select id from "public"."__drizzle_migrations" where hash = $1`,
      [hash],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      console.log(`already marked: hash=${hash.slice(0, 12)}…`);
      continue;
    }

    await client.query(
      `insert into "public"."__drizzle_migrations" (hash, created_at) values ($1, $2)`,
      [hash, folderMillis],
    );
    console.log(`marked applied: hash=${hash.slice(0, 12)}… (ts=${folderMillis})`);
  }

  console.log("Baseline sync complete.");
} finally {
  await client.end();
}
