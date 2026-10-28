import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { requireUser } from "@/lib/session";
import { signOutUser } from "@/app/actions/auth";

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isSuper = user.role === "super_admin";

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <HStack gap={2} vAlign="center" hAlign="between">
          <nav className="app-shell__nav" aria-label="Main">
            <Heading level={4}>QR Studio</Heading>
            <Button label="Dashboard" variant="ghost" size="sm" href="/dashboard" />
            {isSuper && <Button label="Admin" variant="ghost" size="sm" href="/admin" />}
          </nav>
          <form action={signOutUser} id="sign-out-form">
            <Button label="Sign out" variant="secondary" size="sm" type="submit" />
          </form>
        </HStack>
      </header>
      <main className="app-shell__main" id="main-content">
        {children}
      </main>
    </div>
  );
}
