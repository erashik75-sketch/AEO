import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";

const magicLinkConfigured =
  !!process.env.EMAIL_SERVER_HOST &&
  !!process.env.EMAIL_FROM &&
  !!process.env.AUTH_SECRET;

const providers = [];

if (magicLinkConfigured) {
  providers.push(
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  );
}

/** Local-only instant sign-in when SMTP is not configured. */
if (process.env.NODE_ENV === "development") {
  providers.push(
    Credentials({
      id: "dev-email",
      name: "Dev email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email?.includes("@")) return null;
        const user = await prisma.user.upsert({
          where: { email: email.toLowerCase() },
          update: {},
          create: { email: email.toLowerCase() },
        });
        return user;
      },
    })
  );
}

if (providers.length === 0) {
  providers.push(
    Credentials({
      id: "disabled",
      name: "Configure email auth",
      credentials: {},
      async authorize() {
        return null;
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers,
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        });
        session.user.plan = (dbUser?.plan ?? "FREE") as Plan;
      }
      return session;
    },
  },
});
