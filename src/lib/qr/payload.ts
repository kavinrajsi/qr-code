import { randomBytes } from "node:crypto";
import * as zod from "zod";

export const urlPayloadSchema = zod.object({
  url: zod.url({ protocol: /^https?$/ }).max(2000),
});

export const mapPayloadSchema = zod.object({
  latitude: zod.coerce.number().min(-90).max(90),
  longitude: zod.coerce.number().min(-180).max(180),
  label: zod.string().trim().max(120).optional().default(""),
});

export const vcardPayloadSchema = zod.object({
  firstName: zod.string().trim().min(1).max(60),
  lastName: zod.string().trim().max(60).optional().default(""),
  organization: zod.string().trim().max(120).optional().default(""),
  title: zod.string().trim().max(120).optional().default(""),
  phone: zod.string().trim().max(30).optional().default(""),
  email: zod.email().max(120).or(zod.literal("")).optional().default(""),
  website: zod.url().max(300).or(zod.literal("")).optional().default(""),
  address: zod.string().trim().max(200).optional().default(""),
});

export type UrlPayload = zod.infer<typeof urlPayloadSchema>;
export type MapPayload = zod.infer<typeof mapPayloadSchema>;
export type VCardPayload = zod.infer<typeof vcardPayloadSchema>;
export type QrType = "url" | "map" | "vcard";

// Keep static QR codes scannable. Above this, phones struggle to read the code.
const MAXIMUM_STATIC_BYTES = 1500;

// RFC 6350 text escaping: backslash, semicolon, comma, newline.
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildVCard(card: VCardPayload): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(card.lastName)};${escapeVCardValue(card.firstName)};;;`,
    `FN:${escapeVCardValue([card.firstName, card.lastName].filter(Boolean).join(" "))}`,
  ];
  if (card.organization) lines.push(`ORG:${escapeVCardValue(card.organization)}`);
  if (card.title) lines.push(`TITLE:${escapeVCardValue(card.title)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(card.phone)}`);
  if (card.email) lines.push(`EMAIL:${escapeVCardValue(card.email)}`);
  if (card.website) lines.push(`URL:${escapeVCardValue(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(card.address)};;;;`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function buildMapUrl(location: MapPayload): string {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

// Text stored in the QR symbol itself. Dynamic codes encode the redirect URL;
// static codes encode the final content directly.
export function encodedContent(input: {
  type: QrType;
  payload: unknown;
  isDynamic: boolean;
  appUrl: string;
  shortCode?: string | null;
}): string {
  if (input.isDynamic) {
    if (!input.shortCode) throw new Error("dynamic code needs a short code");
    return `${input.appUrl.replace(/\/$/, "")}/q/${input.shortCode}`;
  }
  let content: string;
  switch (input.type) {
    case "url":
      content = urlPayloadSchema.parse(input.payload).url;
      break;
    case "map":
      content = buildMapUrl(mapPayloadSchema.parse(input.payload));
      break;
    case "vcard":
      content = buildVCard(vcardPayloadSchema.parse(input.payload));
      break;
  }
  if (Buffer.byteLength(content, "utf8") > MAXIMUM_STATIC_BYTES) {
    throw new Error("Content is too long for a static QR code. Shorten it or use a dynamic code.");
  }
  return content;
}

// 31 symbols: digits 2-9 and letters a-z without i, l, o (look-alikes).
const SHORT_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SHORT_CODE_LENGTH = 8;
export const SHORT_CODE_PATTERN = /^[23456789abcdefghjkmnpqrstuvwxyz]{8}$/;

export function isShortCode(candidateCode: string): boolean {
  return SHORT_CODE_PATTERN.test(candidateCode);
}

// Eight symbols, rejection-sampled so every symbol is equally likely (no modulo bias).
export function newShortCode(): string {
  const acceptBelow = 256 - (256 % SHORT_CODE_ALPHABET.length); // 248
  let generatedCode = "";
  while (generatedCode.length < SHORT_CODE_LENGTH) {
    for (const randomByte of randomBytes(16)) {
      if (randomByte < acceptBelow && generatedCode.length < SHORT_CODE_LENGTH) {
        generatedCode += SHORT_CODE_ALPHABET[randomByte % SHORT_CODE_ALPHABET.length];
      }
    }
  }
  return generatedCode;
}
