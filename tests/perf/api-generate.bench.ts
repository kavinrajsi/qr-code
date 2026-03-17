import { bench, describe, vi, beforeEach } from "vitest";
import { createMockSupabase, jsonPostRequest } from "./helpers";

// ── Mock setup ─────────────────────────────────────────────────────────────

const { client: mockSupabase } = createMockSupabase();

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

// Reconfigure insert mock to return inserted data
const insertResult = {
  data: [{ id: "qr-1", slug: "abc12345", name: "Test QR", qr_url: "/qr/abc12345" }],
  error: null,
};

beforeEach(() => {
  mockSupabase.from.mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(insertResult),
    }),
  });
});

// Import after mocks are set up
const { POST } = await import("@/app/api/qr/generate/route");

// ── Fixtures ───────────────────────────────────────────────────────────────

const singleURLPayload = {
  name: "My Website",
  qr_type: "url",
  destination_url: "https://example.com",
};

const singleContactPayload = {
  name: "Contact Card",
  qr_type: "contact",
  content_data: {
    first_name: "John",
    last_name: "Doe",
    phone: "+1-555-123-4567",
    email: "john@example.com",
    company: "Acme Corp",
  },
};

const bulkPayload10 = Array.from({ length: 10 }, (_, i) => ({
  name: `QR ${i}`,
  qr_type: "url",
  destination_url: `https://example.com/page/${i}`,
}));

const bulkPayload50 = Array.from({ length: 50 }, (_, i) => ({
  name: `QR ${i}`,
  qr_type: "url",
  destination_url: `https://example.com/page/${i}`,
}));

// ── Benchmarks ─────────────────────────────────────────────────────────────

describe("POST /api/qr/generate", () => {
  bench("single URL QR code", async () => {
    const req = jsonPostRequest("/api/qr/generate", singleURLPayload);
    await POST(req);
  });

  bench("single contact QR code", async () => {
    const req = jsonPostRequest("/api/qr/generate", singleContactPayload);
    await POST(req);
  });

  bench("bulk 10 URL QR codes", async () => {
    const req = jsonPostRequest("/api/qr/generate", bulkPayload10);
    await POST(req);
  });

  bench("bulk 50 URL QR codes", async () => {
    const req = jsonPostRequest("/api/qr/generate", bulkPayload50);
    await POST(req);
  });
});

describe("POST /api/qr/generate — validation", () => {
  bench("missing name (validation failure)", async () => {
    const req = jsonPostRequest("/api/qr/generate", { qr_type: "url", destination_url: "https://x.com" });
    await POST(req);
  });

  bench("missing content data (validation failure)", async () => {
    const req = jsonPostRequest("/api/qr/generate", { name: "Test", qr_type: "url" });
    await POST(req);
  });
});
