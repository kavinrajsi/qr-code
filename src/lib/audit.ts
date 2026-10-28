import "server-only";
import { getDatabase, schema } from "@/database";

// Audit rows hold identifiers and actions only. Never email addresses.
export async function recordAuditEntry(actorIdentifier: string, action: string, target?: string): Promise<void> {
  await getDatabase().insert(schema.auditLog).values({ actorId: actorIdentifier, action, target: target ?? null });
}
