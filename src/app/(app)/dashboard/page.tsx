import { Suspense } from "react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
