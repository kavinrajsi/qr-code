import { describe, expect, it } from "vitest";
import {
  buildMapUrl,
  buildVCard,
  encodedContent,
  isShortCode,
  newShortCode,
  urlPayloadSchema,
  vcardPayloadSchema,
} from "./payload";

describe("buildVCard", () => {
  it("builds a vCard 3.0 block with CRLF line endings", () => {
    const vcardText = buildVCard(
      vcardPayloadSchema.parse({
        firstName: "Ada",
        lastName: "Lovelace",
        phone: "+911234567890",
        email: "ada@example.com",
      }),
    );
    expect(vcardText.split("\r\n")).toEqual([
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Lovelace;Ada;;;",
      "FN:Ada Lovelace",
      "TEL;TYPE=CELL:+911234567890",
      "EMAIL:ada@example.com",
      "END:VCARD",
    ]);
  });

  it("escapes separators and newlines in values", () => {
    const vcardText = buildVCard(vcardPayloadSchema.parse({ firstName: "A;B,C", address: "line1\nline2" }));
    expect(vcardText).toContain("N:;A\\;B\\,C;;;");
    expect(vcardText).toContain("ADR;TYPE=WORK:;;line1\\nline2;;;;");
  });
});

describe("map and url", () => {
  it("builds a Google Maps search link from coordinates", () => {
    expect(buildMapUrl({ latitude: 12.9716, longitude: 77.5946, label: "" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=12.9716,77.5946",
    );
  });

  it("rejects non-http URLs", () => {
    expect(urlPayloadSchema.safeParse({ url: "javascript:alert(1)" }).success).toBe(false);
    expect(urlPayloadSchema.safeParse({ url: "https://example.com" }).success).toBe(true);
  });
});

describe("encodedContent", () => {
  it("encodes the redirect URL for dynamic codes", () => {
    expect(
      encodedContent({
        type: "url",
        payload: { url: "https://a.com" },
        isDynamic: true,
        appUrl: "https://qr.test/",
        shortCode: "abc23456",
      }),
    ).toBe("https://qr.test/q/abc23456");
  });

  it("encodes the final content for static codes", () => {
    expect(encodedContent({ type: "url", payload: { url: "https://a.com" }, isDynamic: false, appUrl: "x" })).toBe(
      "https://a.com",
    );
  });

  it("refuses static content that is too large to scan", () => {
    const oversizedUrl = "https://a.com/" + "x".repeat(1600);
    expect(() =>
      encodedContent({ type: "url", payload: { url: oversizedUrl }, isDynamic: false, appUrl: "x" }),
    ).toThrow(/too long/);
  });
});

describe("newShortCode", () => {
  it("generates codes the redirect route accepts", () => {
    const generatedCodes = new Set<string>();
    for (let attempt = 0; attempt < 1000; attempt++) {
      const generatedCode = newShortCode();
      expect(isShortCode(generatedCode)).toBe(true);
      generatedCodes.add(generatedCode);
    }
    expect(generatedCodes.size).toBe(1000);
  });

  it("rejects look-alike characters", () => {
    expect(isShortCode("abcdefgh")).toBe(true);
    expect(isShortCode("abcdefgi")).toBe(false);
    expect(isShortCode("abcdefgo")).toBe(false);
    expect(isShortCode("abcdefg1")).toBe(false);
  });
});
