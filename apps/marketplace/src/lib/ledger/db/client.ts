import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { config } from "@/lib/config";

import * as schema from "./schema";

export type LedgerSchema = typeof schema;
export type LedgerDb = NodePgDatabase<LedgerSchema>;
export type LedgerTx = Parameters<Parameters<LedgerDb["transaction"]>[0]>[0];
export type LedgerExecutor = LedgerDb | LedgerTx;

let db: LedgerDb | null = null;
let pool: Pool | null = null;

export function getLedgerDb(): LedgerDb | null {
  const url = config.ledger.databaseUrl;

  if (!url) {
    return null;
  }

  if (!db) {
    pool = new Pool({ connectionString: url, max: 8 });
    db = drizzle(pool, { schema, casing: "snake_case" });
  }

  return db;
}
