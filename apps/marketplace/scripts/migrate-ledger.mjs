import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.warn(
    "DATABASE_URL not set — skipping ledger migrations (the Postgres ledger is optional; see apps/marketplace/.env.example).",
  );
  process.exit(0);
}

const migrationsFolder = join(__dirname, "../db/drizzle");

const client = new pg.Client({ connectionString });

await client.connect();

try {
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder,
    migrationsTable: "__drizzle_migrations",
    migrationsSchema: "public",
  });
  console.log("Ledger migrations applied from", migrationsFolder);
} finally {
  await client.end();
}
