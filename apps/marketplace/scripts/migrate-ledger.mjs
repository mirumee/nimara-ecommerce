import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is required (see apps/marketplace/.env.example)");
  process.exit(1);
}

const migrationsDir = join(__dirname, "../db/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString });

await client.connect();

try {
  for (const file of files) {
    const sqlPath = join(migrationsDir, file);
    const sql = readFileSync(sqlPath, "utf8");

    await client.query(sql);
    console.log("Ledger migration applied:", sqlPath);
  }
} finally {
  await client.end();
}
