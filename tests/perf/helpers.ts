import { vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Creates a mock Supabase client with chainable query builder.
 * `resolveWith` sets the data returned by `.single()` or the terminal call.
 */
export function createMockSupabase(resolveWith: Record<string, unknown> | null = null) {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resolveWith, error: null }),
    then: undefined as unknown,
  };
  // Make the chainable itself thenable for queries without .single()
  chainable.select = vi.fn().mockReturnValue({
    ...chainable,
    then: (resolve: (v: { data: unknown; error: null }) => void) =>
      resolve({ data: resolveWith ? [resolveWith] : [], error: null }),
  });

  const client = {
    from: vi.fn().mockReturnValue(chainable),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123", email: "test@example.com" } },
      }),
    },
  };

  return { client, chainable };
}

/** Build a NextRequest for a JSON POST body */
export function jsonPostRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Build a NextRequest for a GET request */
export function getRequest(url: string, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "GET",
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ...headers,
    },
  });
}
