import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { environment } from "@/lib/environment";

// Pooled WebSocket driver so interactive transactions work.

type Database = ReturnType<typeof drizzle<typeof schema>>;
let databaseConnection: Database | undefined;

export function getDatabase(): Database {
  if (!databaseConnection) {
    const pool = new Pool({ connectionString: environment().DATABASE_URL });
    databaseConnection = drizzle(pool, { schema });
  }
  return databaseConnection;
}

export { schema };
