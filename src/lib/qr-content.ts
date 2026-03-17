import type {
  QRType,
  QRContentData,
  ContactContentData,
  SMSContentData,
  EmailContentData,
  PhoneContentData,
  TextContentData,
  MultiURLContentData,
  AppContentData,
  PDFContentData,
} from "@/types";

/**
 * Encode QR content data into the string that gets embedded in the QR image.
 * For static QR codes, this is the actual content.
 * For dynamic QR codes, the QR encodes the redirect URL instead.
 */
export function encodeQRContent(type: QRType, data: QRContentData): string {
  switch (type) {
    case "url":
      return (data as { url: string }).url || "";
    case "pdf":
      return (data as PDFContentData).file_url || "";
    case "phone":
      return `tel:${(data as PhoneContentData).phone}`;
    case "sms": {
      const sms = data as SMSContentData;
      const uri = `sms:${sms.phone}`;
      return sms.message ? `${uri}?body=${encodeURIComponent(sms.message)}` : uri;
    }
    case "email": {
      const email = data as EmailContentData;
      const params = new URLSearchParams();
      if (email.subject) params.set("subject", email.subject);
      if (email.body) params.set("body", email.body);
      const qs = params.toString();
      return `mailto:${email.address}${qs ? `?${qs}` : ""}`;
    }
    case "text":
      return (data as TextContentData).text || "";
    case "contact":
      return buildVCard(data as ContactContentData);
    case "multi_url": {
      const multi = data as MultiURLContentData;
      return multi.urls?.[0]?.url || "";
    }
    case "app": {
      const app = data as AppContentData;
      return app.fallback_url || app.ios_url || app.android_url || "";
    }
    default:
      return "";
  }
}

/**
 * Build a destination_url for storage in the DB.
 * For types that need a landing page, returns null (redirect route handles it).
 */
export function buildDestinationUrl(type: QRType, data: QRContentData): string {
  switch (type) {
    case "url":
      return (data as { url: string }).url || "";
    case "pdf":
      return (data as PDFContentData).file_url || "";
    case "phone":
      return `tel:${(data as PhoneContentData).phone}`;
    case "sms": {
      const sms = data as SMSContentData;
      return sms.message
        ? `sms:${sms.phone}?body=${encodeURIComponent(sms.message)}`
        : `sms:${sms.phone}`;
    }
    case "email": {
      const email = data as EmailContentData;
      const params = new URLSearchParams();
      if (email.subject) params.set("subject", email.subject);
      if (email.body) params.set("body", email.body);
      const qs = params.toString();
      return `mailto:${email.address}${qs ? `?${qs}` : ""}`;
    }
    case "text":
      return (data as TextContentData).text || "";
    case "contact":
      return buildVCard(data as ContactContentData);
    case "multi_url":
      return (data as MultiURLContentData).urls?.[0]?.url || "";
    case "app":
      return (data as AppContentData).fallback_url || "";
    default:
      return "";
  }
}

/** Types that require a landing page for dynamic QR codes */
export const LANDING_PAGE_TYPES: QRType[] = ["multi_url", "app", "text"];

/** Types that must always be dynamic (need server-side routing) */
export const FORCE_DYNAMIC_TYPES: QRType[] = ["multi_url", "app"];

export function buildVCard(c: ContactContentData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${c.last_name};${c.first_name};;;`,
    `FN:${c.first_name} ${c.last_name}`,
  ];
  if (c.company) lines.push(`ORG:${c.company}`);
  if (c.job_title) lines.push(`TITLE:${c.job_title}`);
  if (c.phone) lines.push(`TEL:${c.phone}`);
  if (c.email) lines.push(`EMAIL:${c.email}`);
  if (c.address) lines.push(`ADR:;;${c.address};;;;`);
  if (c.website) lines.push(`URL:${c.website}`);
  if (c.profile_image) lines.push(`PHOTO;VALUE=uri:${c.profile_image}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}
