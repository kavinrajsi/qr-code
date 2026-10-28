import { notFound } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/VStack";
import { requireUser } from "@/lib/session";
import { createStore } from "@/app/actions/stores";
import { Field } from "@/components/field";

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function NewStorePage() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "super_admin") notFound();

  return (
    <Card padding={4} maxWidth={520}>
      <form action={createStore}>
        <VStack gap={4}>
          <Heading level={2}>New store</Heading>
          <Field label="Store name" name="name" required maxLength={80} />
          <Field label="GSTIN" name="gstin" maxLength={15} hint="Optional. 15 characters." />
          <Button label="Create store" variant="primary" type="submit" />
        </VStack>
      </form>
    </Card>
  );
}
