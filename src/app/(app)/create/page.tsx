import { QRForm } from "@/components/qr/qr-form";
import { BulkUpload } from "@/components/qr/bulk-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Create QR Code</h1>
      <Tabs defaultValue="single">
        <TabsList className="mb-6">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="bulk">Bulk (CSV)</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <QRForm />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
