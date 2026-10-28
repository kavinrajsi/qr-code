// Side-effect import. Load .env.local the same way Next does. Import this first:
// ES imports are hoisted, so the call must live in its own module.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
