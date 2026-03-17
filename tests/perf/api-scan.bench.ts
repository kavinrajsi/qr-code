import { bench, describe, vi } from "vitest";
import { createMockSupabase, jsonPostRequest } from "./helpers";

// ── Mock setup ─────────────────────────────────────────────────────────────

const { client: mockSupabase, chainable } = createMockSupabase({ id: "qr-uuid-1" });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

// Mock scan logger to isolate handler overhead
vi.mock("@/lib/scan-logger", () => ({
  logScan: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import("@/app/api/qr/scan/route");

// ── Benchmarks ─────────────────────────────────────────────────────────────

describe("POST /api/qr/scan", () => {
  bench("valid qr_id", async () => {
    chainable.single.mockResolvedValue({ data: { id: "qr-uuid-1" }, error: null });
    const req = jsonPostRequest("/api/qr/scan", { qr_id: "qr-uuid-1" });
    await POST(req);
  });

  bench("nonexistent qr_id (404 path)", async () => {
    chainable.single.mockResolvedValue({ data: null, error: null });
    const req = jsonPostRequest("/api/qr/scan", { qr_id: "nonexistent" });
    await POST(req);
  });

  bench("missing qr_id (validation short-circuit)", async () => {
    const req = jsonPostRequest("/api/qr/scan", {});
    await POST(req);
  });

  bench("invalid qr_id type (validation short-circuit)", async () => {
    const req = jsonPostRequest("/api/qr/scan", { qr_id: 12345 });
    await POST(req);
  });
});
