import { Pool } from "pg";

import { config } from "@/lib/config";

let pool: Pool | null = null;

export function getLedgerPool(): Pool | null {
  const url = config.ledger.databaseUrl;

  if (!url) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: url, max: 8 });
  }

  return pool;
}
