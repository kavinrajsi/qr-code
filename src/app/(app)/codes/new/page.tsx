import { notFound } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { isPermitted } from "@/lib/auth/permissions";
import { getStoreAccess, requireUser } from "@/lib/session";
import { createCode } from "@/app/actions/codes";
import { Field, TextAreaField } from "@/components/field";
import { CREDITS_PER_CODE } from "@/lib/billing/config";

type SearchParameters = Promise<{ storeId?: string; type?: string }>;

const CODE_TYPE_OPTIONS = [
  { key: "url", label: "URL" },
  { key: "map", label: "Map" },
  { key: "vcard", label: "Visiting card" },
] as const;

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function NewCodePage({ searchParams }: { searchParams: SearchParameters }) {
  const { storeId, type = "url" } = await searchParams;
  if (!storeId) notFound();
  const user = await requireUser();
  const access = await getStoreAccess(user, storeId);
  if (!isPermitted(user.role, access, "code.create")) notFound();
  const selectedType = (CODE_TYPE_OPTIONS.find((option) => option.key === type) ?? CODE_TYPE_OPTIONS[0]).key;

  return (
    <VStack gap={4}>
      <Heading level={2}>New QR code</Heading>
      <HStack gap={2}>
        {CODE_TYPE_OPTIONS.map((option) => (
          <Button
            key={option.key}
            label={option.label}
            variant={option.key === selectedType ? "primary" : "secondary"}
            size="sm"
            href={`/codes/new?storeId=${storeId}&type=${option.key}`}
          />
        ))}
      </HStack>

      <Card padding={4} maxWidth={560}>
        <form action={createCode} id="create-code-form">
          <input type="hidden" name="storeId" value={storeId} />
          <input type="hidden" name="type" value={selectedType} />
          <VStack gap={4}>
            <Field label="Name" name="title" required maxLength={80} hint="Shown in your store list." />

            {selectedType === "url" && (
              <Field label="Website URL" name="url" type="url" required placeholder="https://example.com" />
            )}

            {selectedType === "map" && (
              <>
                <Field
                  label="Latitude"
                  name="latitude"
                  type="number"
                  required
                  step="any"
                  min={-90}
                  max={90}
                  placeholder="12.9716"
                />
                <Field
                  label="Longitude"
                  name="longitude"
                  type="number"
                  required
                  step="any"
                  min={-180}
                  max={180}
                  placeholder="77.5946"
                />
                <Field label="Place label" name="label" maxLength={120} />
              </>
            )}

            {selectedType === "vcard" && (
              <>
                <Field label="First name" name="firstName" required maxLength={60} />
                <Field label="Last name" name="lastName" maxLength={60} />
                <Field label="Company" name="organization" maxLength={120} />
                <Field label="Job title" name="jobTitle" maxLength={120} />
                <Field label="Phone" name="phone" type="tel" maxLength={30} />
                <Field label="Email" name="email" type="email" maxLength={120} />
                <Field label="Website" name="website" type="url" maxLength={300} />
                <TextAreaField label="Address" name="address" />
              </>
            )}

            <label className="field field--checkbox">
              <input type="checkbox" name="isDynamic" id="field-is-dynamic" defaultChecked />
              <span>
                <strong>Dynamic</strong>: the printed code keeps working when you change the target, and scans
                are tracked.
              </span>
            </label>

            <Text>Creating this code uses {CREDITS_PER_CODE} credit.</Text>
            <Button label="Create code" variant="primary" type="submit" />
          </VStack>
        </form>
      </Card>
    </VStack>
  );
}
