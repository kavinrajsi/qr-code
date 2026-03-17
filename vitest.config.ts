import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["tests/**/*.bench.ts", "tests/**/*.test.ts"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
