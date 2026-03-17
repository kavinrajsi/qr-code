import { bench, describe, vi } from "vitest";
import { createMockSupabase, jsonPostRequest } from "./helpers";

// ── Mock setup ─────────────────────────────────────────────────────────────

const { client: mockSupabase, chainable } = createMockSupabase({ password: "secret123" });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

const { POST } = await import("@/app/api/qr/verify/route");

// ── Benchmarks ─────────────────────────────────────────────────────────────

describe("POST /api/qr/verify", () => {
  bench("correct password", async () => {
    chainable.single.mockResolvedValue({ data: { password: "secret123" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "abc123", password: "secret123" });
    await POST(req);
  });

  bench("incorrect password (same length)", async () => {
    chainable.single.mockResolvedValue({ data: { password: "secret123" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "abc123", password: "wrongpass" });
    await POST(req);
  });

  bench("incorrect password (different length)", async () => {
    chainable.single.mockResolvedValue({ data: { password: "secret123" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "abc123", password: "x" });
    await POST(req);
  });

  bench("nonexistent slug", async () => {
    chainable.single.mockResolvedValue({ data: null, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "notfound", password: "any" });
    await POST(req);
  });

  bench("missing parameters (validation short-circuit)", async () => {
    const req = jsonPostRequest("/api/qr/verify", { slug: "abc123" });
    await POST(req);
  });
});

describe("POST /api/qr/verify — timing safety", () => {
  bench("correct password timing baseline", async () => {
    chainable.single.mockResolvedValue({ data: { password: "MySecurePassword2024!" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "s1", password: "MySecurePassword2024!" });
    await POST(req);
  });

  bench("wrong password (same length) — should be similar timing", async () => {
    chainable.single.mockResolvedValue({ data: { password: "MySecurePassword2024!" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "s1", password: "XySecurePassword2024!" });
    await POST(req);
  });

  bench("wrong password (very different length)", async () => {
    chainable.single.mockResolvedValue({ data: { password: "MySecurePassword2024!" }, error: null });
    const req = jsonPostRequest("/api/qr/verify", { slug: "s1", password: "a" });
    await POST(req);
  });
});
