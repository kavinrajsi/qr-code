import "server-only";
import { createHmac } from "node:crypto";
import { environment } from "@/lib/environment";

// Emails are stored only as keyed hashes. Normalise before hashing so
// "Name@Gmail.com " and "name@gmail.com" map to the same row.
export function hashEmail(emailAddress: string): string {
  const normalisedEmail = emailAddress.trim().toLowerCase();
  return createHmac("sha256", environment().HASH_PEPPER).update(normalisedEmail).digest("hex");
}

export function hashIpAddress(ipAddress: string): string {
  return createHmac("sha256", environment().HASH_PEPPER).update(`ip-address:${ipAddress}`).digest("hex");
}
