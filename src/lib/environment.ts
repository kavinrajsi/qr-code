import * as zod from "zod";

// Read lazily so `next build` does not need runtime secrets.
const environmentSchema = zod.object({
  DATABASE_URL: zod.string().min(1),
  AUTH_SECRET: zod.string().min(1),
  AUTH_GOOGLE_ID: zod.string().min(1),
  AUTH_GOOGLE_SECRET: zod.string().min(1),
  // Super admin email: environment variable only, never committed, never sent to the client.
  SUPER_ADMIN_EMAIL: zod.string().email(),
  // Server-side pepper for email hashing (HMAC). Rotating it breaks lookups.
  HASH_PEPPER: zod.string().min(16),
  APP_URL: zod.string().url().default("http://localhost:3000"),
  RAZORPAY_KEY_ID: zod.string().min(1),
  RAZORPAY_KEY_SECRET: zod.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: zod.string().min(1),
  CREDIT_PRICE_PAISE: zod.coerce.number().int().positive().default(1000),
});

export type Environment = zod.infer<typeof environmentSchema>;

let cachedEnvironment: Environment | undefined;

export function environment(): Environment {
  if (!cachedEnvironment) {
    const parsedEnvironment = environmentSchema.safeParse(process.env);
    if (!parsedEnvironment.success) {
      // Report variable names only; values may be secrets.
      const variableNames = parsedEnvironment.error.issues.map((issue) => issue.path.join(".")).join(", ");
      throw new Error(`Missing or invalid environment variables: ${variableNames}`);
    }
    cachedEnvironment = parsedEnvironment.data;
  }
  return cachedEnvironment;
}
