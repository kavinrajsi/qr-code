import Link from "next/link";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

// Shared header and footer for the public site (home, features, help, contact, policies).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell">
      <header className="public-shell__header">
        <HStack gap={2} vAlign="center" hAlign="between">
          <Link href="/" className="public-shell__brand">
            <Heading level={4}>QR Studio</Heading>
          </Link>
          <nav className="public-shell__nav" aria-label="Site">
            <Button label="Features" variant="ghost" size="sm" href="/features" />
            <Button label="Help" variant="ghost" size="sm" href="/help" />
            <Button label="Contact" variant="ghost" size="sm" href="/contact" />
            <Button label="Sign in" variant="primary" size="sm" href="/login" />
          </nav>
        </HStack>
      </header>

      <main className="public-shell__main" id="main-content">
        {children}
      </main>

      <footer className="public-shell__footer">
        <VStack gap={2}>
          <nav className="public-shell__nav" aria-label="Legal">
            <Button label="Privacy" variant="ghost" size="sm" href="/privacy" />
            <Button label="Terms" variant="ghost" size="sm" href="/terms" />
            <Button label="Refunds" variant="ghost" size="sm" href="/refunds" />
            <Button label="Contact" variant="ghost" size="sm" href="/contact" />
          </nav>
          <Text>© [BUSINESS NAME]. All rights reserved.</Text>
        </VStack>
      </footer>
    </div>
  );
}
