import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { signInWithGoogle } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <main className="login-page" id="login">
      <div className="login-page__panel">
        <Card elevation="low" padding={6}>
          <form action={signInWithGoogle} id="login-form">
            <VStack gap={4}>
              <Heading level={1}>QR Studio</Heading>
              <Text>Create vCard, URL and map QR codes. Track dynamic codes by store.</Text>
              <Button label="Sign in with Google" variant="primary" type="submit" width="100%" />
            </VStack>
          </form>
        </Card>
      </div>
    </main>
  );
}
