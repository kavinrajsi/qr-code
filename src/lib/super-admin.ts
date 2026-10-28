import "server-only";
import { environment } from "@/lib/environment";
import { hashEmail } from "@/lib/hash";

// Server-only. The super admin email lives in the SUPER_ADMIN_EMAIL environment variable and
// is compared by hash. It is never returned to the client, logged, or stored raw.
export function isSuperAdminEmail(emailAddress: string): boolean {
  return hashEmail(emailAddress) === hashEmail(environment().SUPER_ADMIN_EMAIL);
}

export const SUPER_ADMIN_LABEL = "Platform owner";
