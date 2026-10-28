import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { and, eq, isNull } from "drizzle-orm";
import { getDatabase, schema } from "@/database";
import { hashEmail } from "@/lib/hash";
import { isSuperAdminEmail } from "@/lib/super-admin";

export const { handlers, auth: readSession, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return false;
      const emailHash = hashEmail(user.email);
      const isSuperAdmin = isSuperAdminEmail(user.email);
      const database = getDatabase();

      // Create the user on first sign-in. The super admin row is created with
      // the protected flag; the database trigger then locks it.
      await database
        .insert(schema.users)
        .values({
          emailHash,
          name: user.name ?? null,
          role: isSuperAdmin ? "super_admin" : "user",
          isSuperAdmin,
        })
        .onConflictDoNothing({ target: schema.users.emailHash });

      const [userRecord] = await database
        .select({ id: schema.users.id, suspended: schema.users.suspended })
        .from(schema.users)
        .where(eq(schema.users.emailHash, emailHash))
        .limit(1);

      if (!userRecord || userRecord.suspended) return false;

      // Link any store invites made for this email before the person signed in.
      await database
        .update(schema.storeMembers)
        .set({ userId: userRecord.id })
        .where(and(eq(schema.storeMembers.emailHash, emailHash), isNull(schema.storeMembers.userId)));

      return true;
    },
    async jwt({ token, user }) {
      // Only the opaque internal identifier goes into the token, never the email.
      // Drop the default email claim: the browser must never receive it.
      Reflect.deleteProperty(token, "email");
      if (user?.email) {
        const [userRecord] = await getDatabase()
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.emailHash, hashEmail(user.email)))
          .limit(1);
        if (userRecord) token.userIdentifier = userRecord.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userIdentifier as string;
      Reflect.deleteProperty(session.user, "email");
      return session;
    },
  },
});
