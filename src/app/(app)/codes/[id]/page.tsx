import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { isPermitted } from "@/lib/auth/permissions";
import { getStoreAccess, requireUser } from "@/lib/session";
import { codeWithStore, scansForCode } from "@/lib/store-queries";
import {
  encodedContent,
  mapPayloadSchema,
  urlPayloadSchema,
  vcardPayloadSchema,
} from "@/lib/qr/payload";
import { environment } from "@/lib/environment";
import { setCodeStatus, updateCode } from "@/app/actions/codes";
import { Field, TextAreaField } from "@/components/field";

type RouteParameters = { params: Promise<{ id: string }> };

function payloadFields(type: string, payload: Record<string, unknown>) {
  if (type === "url") {
    return (
      <Field label="Website URL" name="url" type="url" required defaultValue={urlPayloadSchema.parse(payload).url} />
    );
  }
  if (type === "map") {
    const location = mapPayloadSchema.parse(payload);
    return (
      <>
        <Field label="Latitude" name="latitude" type="number" step="any" required defaultValue={location.latitude} />
        <Field label="Longitude" name="longitude" type="number" step="any" required defaultValue={location.longitude} />
        <Field label="Place label" name="label" defaultValue={location.label} />
      </>
    );
  }
  const card = vcardPayloadSchema.parse(payload);
  return (
    <>
      <Field label="First name" name="firstName" required defaultValue={card.firstName} />
      <Field label="Last name" name="lastName" defaultValue={card.lastName} />
      <Field label="Company" name="organization" defaultValue={card.organization} />
      <Field label="Job title" name="jobTitle" defaultValue={card.title} />
      <Field label="Phone" name="phone" type="tel" defaultValue={card.phone} />
      <Field label="Email" name="email" type="email" defaultValue={card.email} />
      <Field label="Website" name="website" type="url" defaultValue={card.website} />
      <TextAreaField label="Address" name="address" defaultValue={card.address} />
    </>
  );
}

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function CodePage({ params }: RouteParameters) {
  const { id } = await params;
  const user = await requireUser();
  const codeDetails = await codeWithStore(id);
  if (!codeDetails) notFound();
  const access = await getStoreAccess(user, codeDetails.code.storeId);
  if (!isPermitted(user.role, access, "code.view")) notFound();

  const { code } = codeDetails;
  const canEdit = isPermitted(user.role, access, "code.edit");
  const canDisable = isPermitted(user.role, access, "code.disable");
  const content = encodedContent({
    type: code.type as "url" | "map" | "vcard",
    payload: code.payload,
    isDynamic: code.isDynamic,
    appUrl: environment().APP_URL,
    shortCode: code.shortCode,
  });
  const qrSvgMarkup = await QRCode.toString(content, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
  const scanRecords = await scansForCode(id);

  const scanCountByDevice = scanRecords.reduce<Record<string, number>>((countsByDevice, scan) => {
    const deviceName = scan.device ?? "unknown";
    countsByDevice[deviceName] = (countsByDevice[deviceName] ?? 0) + 1;
    return countsByDevice;
  }, {});
  const currentTime = new Date();
  const sevenDaysInMilliseconds = 7 * 24 * 3600 * 1000;
  const scansInLastSevenDays = scanRecords.filter(
    (scan) => currentTime.getTime() - scan.scannedAt.getTime() < sevenDaysInMilliseconds,
  ).length;

  const qrDataUri = `data:image/svg+xml;base64,${Buffer.from(qrSvgMarkup).toString("base64")}`;

  return (
    <VStack gap={5}>
      <HStack gap={2} hAlign="between" vAlign="center">
        <VStack gap={1}>
          <Heading level={2}>{code.title}</Heading>
          <HStack gap={2}>
            <Badge label={code.type} variant="info" />
            <Badge
              label={code.isDynamic ? "dynamic" : "static"}
              variant={code.isDynamic ? "success" : "neutral"}
            />
            {code.status === "disabled" && <Badge label="disabled" variant="error" />}
          </HStack>
          <Text>{codeDetails.storeName}</Text>
        </VStack>
      </HStack>

      <Card padding={4}>
        <div className="code-preview" id="qr-preview">
          <img
            className="code-preview__image"
            src={qrDataUri}
            alt={`QR code for ${code.title}`}
            width={220}
            height={220}
          />
          <div className="code-preview__details">
            <Text>
              {code.isDynamic ? `Scans go to: ${content}` : "Static code: content is encoded directly."}
            </Text>
            <a
              className="code-preview__download"
              href={qrDataUri}
              download={`${code.title.replace(/\W+/g, "-")}.svg`}
            >
              Download SVG
            </a>
          </div>
        </div>
      </Card>

      {code.isDynamic && (
        <Card padding={4}>
          <VStack gap={3}>
            <div id="code-tracking">
              <Heading level={3}>Tracking</Heading>
              <Text>
                {scanRecords.length} total scans · {scansInLastSevenDays} in the last 7 days
              </Text>
              <Text>
                {Object.entries(scanCountByDevice)
                  .map(([deviceName, scanCount]) => `${deviceName}: ${scanCount}`)
                  .join(" · ") || "No scans yet."}
              </Text>
            </div>
            <div className="scan-log">
              {scanRecords.length === 0 && <Text>Scans will appear here.</Text>}
              {scanRecords.slice(0, 20).map((scan, scanIndex) => (
                <Text key={scanIndex}>
                  {scan.scannedAt.toLocaleString("en-IN")} · {scan.device ?? "unknown"} · {scan.country ?? "—"}
                </Text>
              ))}
            </div>
          </VStack>
        </Card>
      )}

      {canEdit && (
        <Card padding={4} maxWidth={560}>
          <form action={updateCode} id="edit-code-form">
            <input type="hidden" name="codeId" value={id} />
            <VStack gap={4}>
              <Heading level={3}>Edit</Heading>
              <Field label="Name" name="title" required defaultValue={code.title} maxLength={80} />
              {code.isDynamic ? (
                payloadFields(code.type, code.payload as Record<string, unknown>)
              ) : (
                <Text>
                  Static codes cannot change their content. Create a dynamic code to edit the target later.
                </Text>
              )}
              <Button label="Save changes" variant="primary" type="submit" />
            </VStack>
          </form>
        </Card>
      )}

      {canDisable && (
        <form action={setCodeStatus} id="code-status-form">
          <input type="hidden" name="codeId" value={id} />
          <input type="hidden" name="status" value={code.status === "active" ? "disabled" : "active"} />
          <Button
            label={code.status === "active" ? "Disable code" : "Enable code"}
            variant={code.status === "active" ? "destructive" : "secondary"}
            type="submit"
          />
        </form>
      )}
    </VStack>
  );
}
