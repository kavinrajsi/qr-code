import { bench, describe, vi } from "vitest";
import { createMockSupabase, getRequest } from "./helpers";

// ── Mock setup ─────────────────────────────────────────────────────────────

const { client: mockSupabase, chainable } = createMockSupabase();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}));

vi.mock("@/lib/scan-logger", () => ({
  logScan: vi.fn().mockResolvedValue(undefined),
}));

const { GET } = await import("@/app/qr/[slug]/route");

// ── Fixtures ───────────────────────────────────────────────────────────────

const urlQR = {
  id: "qr-1",
  qr_type: "url",
  destination_url: "https://example.com",
  content_data: { url: "https://example.com" },
  password: null,
  expires_at: null,
  is_active: true,
};

const contactQR = {
  id: "qr-2",
  qr_type: "contact",
  destination_url: "",
  content_data: {
    first_name: "John",
    last_name: "Doe",
    phone: "+1-555-1234",
    email: "john@example.com",
    company: "Acme Corp",
    job_title: "Engineer",
    address: "123 Main St",
    website: "https://johndoe.dev",
  },
  password: null,
  expires_at: null,
  is_active: true,
};

const passwordQR = {
  id: "qr-3",
  qr_type: "url",
  destination_url: "https://secret.example.com",
  content_data: { url: "https://secret.example.com" },
  password: "secretpass",
  expires_at: null,
  is_active: true,
};

const multiUrlQR = {
  id: "qr-4",
  qr_type: "multi_url",
  destination_url: "",
  content_data: {
    urls: [
      { title: "GitHub", url: "https://github.com" },
      { title: "Twitter", url: "https://twitter.com" },
    ],
  },
  password: null,
  expires_at: null,
  is_active: true,
};

const expiredQR = {
  id: "qr-5",
  qr_type: "url",
  destination_url: "https://example.com",
  content_data: { url: "https://example.com" },
  password: null,
  expires_at: "2020-01-01T00:00:00Z",
  is_active: true,
};

function makeParams(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) };
}

// ── Benchmarks ─────────────────────────────────────────────────────────────

describe("GET /qr/[slug] — URL redirect", () => {
  bench("simple URL redirect", async () => {
    chainable.single.mockResolvedValue({ data: urlQR, error: null });
    const req = getRequest("/qr/abc123");
    await GET(req, makeParams("abc123"));
  });
});

describe("GET /qr/[slug] — contact vCard", () => {
  bench("contact vCard generation + response", async () => {
    chainable.single.mockResolvedValue({ data: contactQR, error: null });
    const req = getRequest("/qr/contact1");
    await GET(req, makeParams("contact1"));
  });
});

describe("GET /qr/[slug] — special cases", () => {
  bench("password-protected (redirect to verify)", async () => {
    chainable.single.mockResolvedValue({ data: passwordQR, error: null });
    const req = getRequest("/qr/pass1");
    await GET(req, makeParams("pass1"));
  });

  bench("multi_url (redirect to landing page)", async () => {
    chainable.single.mockResolvedValue({ data: multiUrlQR, error: null });
    const req = getRequest("/qr/multi1");
    await GET(req, makeParams("multi1"));
  });

  bench("expired QR code (410 response)", async () => {
    chainable.single.mockResolvedValue({ data: expiredQR, error: null });
    const req = getRequest("/qr/expired1");
    await GET(req, makeParams("expired1"));
  });

  bench("nonexistent slug (redirect to home)", async () => {
    chainable.single.mockResolvedValue({ data: null, error: null });
    const req = getRequest("/qr/notfound");
    await GET(req, makeParams("notfound"));
  });
});
