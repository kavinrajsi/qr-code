import { bench, describe } from "vitest";
import { encodeQRContent, buildDestinationUrl, buildVCard } from "@/lib/qr-content";
import { generateSlug } from "@/lib/slug";
import type { ContactContentData, EmailContentData, SMSContentData } from "@/types";

// ── Fixtures ───────────────────────────────────────────────────────────────

const urlData = { url: "https://example.com/some/long/path?query=value&other=param" };

const contactData: ContactContentData = {
  first_name: "John",
  last_name: "Doe",
  phone: "+1-555-123-4567",
  email: "john.doe@example.com",
  company: "Acme Corp",
  job_title: "Senior Engineer",
  address: "123 Main St, Springfield, IL 62704",
  website: "https://johndoe.dev",
  profile_image: "https://cdn.example.com/photos/johndoe.jpg",
};

const contactWithSpecialChars: ContactContentData = {
  first_name: "Jean-Pierre",
  last_name: "O'Brien",
  phone: "+44 20 7946 0958",
  email: "jp@example.com",
  company: "Léon & Fils, Inc.",
  job_title: "CTO; VP Engineering",
  address: "10 Downing St\nLondon\nSW1A 2AA",
};

const emailData: EmailContentData = {
  address: "support@example.com",
  subject: "Inquiry about product",
  body: "Hello,\n\nI'd like to learn more about your services.\n\nBest regards,\nJohn",
};

const smsData: SMSContentData = {
  phone: "+1-555-987-6543",
  message: "Your verification code is 123456",
};

// ── Benchmarks ─────────────────────────────────────────────────────────────

describe("generateSlug", () => {
  bench("default length (8)", () => {
    generateSlug();
  });

  bench("short slug (4)", () => {
    generateSlug(4);
  });

  bench("long slug (16)", () => {
    generateSlug(16);
  });
});

describe("encodeQRContent", () => {
  bench("url type", () => {
    encodeQRContent("url", urlData);
  });

  bench("email type (with subject + body)", () => {
    encodeQRContent("email", emailData);
  });

  bench("sms type (with message)", () => {
    encodeQRContent("sms", smsData);
  });

  bench("contact type (full vCard)", () => {
    encodeQRContent("contact", contactData);
  });

  bench("contact type (special characters)", () => {
    encodeQRContent("contact", contactWithSpecialChars);
  });
});

describe("buildDestinationUrl", () => {
  bench("url type", () => {
    buildDestinationUrl("url", urlData);
  });

  bench("email type", () => {
    buildDestinationUrl("email", emailData);
  });

  bench("contact type", () => {
    buildDestinationUrl("contact", contactData);
  });
});

describe("buildVCard", () => {
  bench("minimal contact (name only)", () => {
    buildVCard({ first_name: "Jane", last_name: "Smith" });
  });

  bench("full contact (all fields)", () => {
    buildVCard(contactData);
  });

  bench("contact with special characters needing escape", () => {
    buildVCard(contactWithSpecialChars);
  });
});
