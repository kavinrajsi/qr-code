import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
