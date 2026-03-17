"use client";

import { QRForm } from "@/components/qr/qr-form";
import { BulkUpload } from "@/components/qr/bulk-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatePage() {
  return (
    <Tabs defaultValue="single">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Create QR Code</h1>
        <TabsList>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="bulk">Bulk (CSV)</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="single">
        <QRForm />
      </TabsContent>
      <TabsContent value="bulk">
        <BulkUpload />
      </TabsContent>
    </Tabs>
  );
}
