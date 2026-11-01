import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

import * as schema from "./schema";

let db: PostgresJsDatabase<typeof schema> | undefined;

/** Client Drizzle (connexion Postgres Supabase), créé à la première utilisation. */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    // `prepare: false` est requis avec le pooler Supabase (mode transaction).
    const client = postgres(getServerEnv().DATABASE_URL, { prepare: false });
    db = drizzle(client, { schema });
  }
  return db;
}
