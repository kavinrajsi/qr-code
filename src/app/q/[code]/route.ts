import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDatabase, schema } from "@/database";
import {
  buildMapUrl,
  buildVCard,
  isShortCode,
  mapPayloadSchema,
  urlPayloadSchema,
  vcardPayloadSchema,
} from "@/lib/qr/payload";
import { hashIpAddress } from "@/lib/hash";

type RouteParameters = { params: Promise<{ code: string }> };

function deviceNameFrom(userAgent: string): string {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone/i.test(userAgent)) return "mobile";
  return userAgent ? "desktop" : "unknown";
}

// Public scan endpoint. Looks up the live target, records the scan after the
// response is sent, and redirects. Dynamic vCards return the contact file.
export async function GET(request: Request, { params }: RouteParameters) {
  const { code } = await params;
  if (!isShortCode(code)) return new Response("Not found", { status: 404 });

  const [codeRecord] = await getDatabase()
    .select({
      id: schema.qrCodes.id,
      type: schema.qrCodes.type,
      title: schema.qrCodes.title,
      payload: schema.qrCodes.payload,
    })
    .from(schema.qrCodes)
    .where(
      and(
        eq(schema.qrCodes.shortCode, code),
        eq(schema.qrCodes.isDynamic, true),
        eq(schema.qrCodes.status, "active"),
      ),
    )
    .limit(1);
  if (!codeRecord) return new Response("Not found", { status: 404 });

  const requestHeaders = request.headers;
  const forwardedForHeader = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const countryCode = requestHeaders.get("x-vercel-ip-country");
  const qrCodeIdentifier = codeRecord.id;

  after(async () => {
    await getDatabase().insert(schema.qrScans).values({
      qrCodeId: qrCodeIdentifier,
      ipAddressHash: forwardedForHeader ? hashIpAddress(forwardedForHeader) : null,
      country: countryCode,
      device: deviceNameFrom(userAgent),
    });
  });

  if (codeRecord.type === "url") {
    const { url: redirectTarget } = urlPayloadSchema.parse(codeRecord.payload);
    return Response.redirect(redirectTarget, 302);
  }
  if (codeRecord.type === "map") {
    return Response.redirect(buildMapUrl(mapPayloadSchema.parse(codeRecord.payload)), 302);
  }
  const vcardText = buildVCard(vcardPayloadSchema.parse(codeRecord.payload));
  return new Response(vcardText, {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `inline; filename="${code}.vcf"`,
      "cache-control": "no-store",
    },
  });
}
