// Runs drizzle migrations, then the idempotent guard SQL (super admin trigger).
// Usage: npm run db:migrate   (loads .env.local the same way Next does)
import "./load-env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { sql } from "drizzle-orm";
import { getDatabase } from "../src/database";

async function main() {
  const database = getDatabase();
  await migrate(database, { migrationsFolder: join(process.cwd(), "drizzle") });
  await database.execute(sql.raw(readFileSync(join(process.cwd(), "src/database/guards.sql"), "utf8")));
  console.log("migrations and guards applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
