// Creates the single protected super admin row from SUPER_ADMIN_EMAIL (environment only).
// The email itself is never written to the database or logs, only its keyed hash.
// Usage: npm run db:seed-super-admin
import "./load-env";
import { createHmac } from "node:crypto";
import { getDatabase, schema } from "../src/database";

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const hashingPepper = process.env.HASH_PEPPER;
  if (!superAdminEmail || !hashingPepper) {
    throw new Error("SUPER_ADMIN_EMAIL and HASH_PEPPER must be set");
  }
  const emailHash = createHmac("sha256", hashingPepper)
    .update(superAdminEmail.trim().toLowerCase())
    .digest("hex");

  await getDatabase()
    .insert(schema.users)
    .values({ emailHash, name: "Super Admin", role: "super_admin", isSuperAdmin: true })
    .onConflictDoNothing({ target: schema.users.emailHash });

  console.log("super admin row ensured");
  process.exit(0);
}

main().catch((error) => {
  console.error("seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
