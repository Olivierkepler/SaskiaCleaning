import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "@auth/core/jwt";
import {
  isGoogleEmailVerified,
  upsertCustomerFromGoogle,
  linkGuestBookingsByEmail,
} from "@/app/lib/customer-identity";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

type CustomerJWT = JWT & {
  customerId?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      if (!isGoogleEmailVerified(profile)) {
        return "/login?error=unverified_email";
      }

      const email =
        typeof profile?.email === "string" ? profile.email : null;
      if (!email) {
        return "/login?error=unverified_email";
      }

      try {
        const customer = await upsertCustomerFromGoogle({
          email,
          name: typeof profile?.name === "string" ? profile.name : null,
          image: typeof profile?.picture === "string" ? profile.picture : null,
          providerAccountId: account.providerAccountId,
          emailVerified: true,
        });

        await linkGuestBookingsByEmail(customer.id, customer.email);
        return true;
      } catch (error) {
        console.error("Google customer upsert failed:", error);
        return "/login?error=AccessDenied";
      }
    },

    async jwt({ token, account, profile }) {
      const customerToken = token as CustomerJWT;

      if (account?.provider === "google" && profile?.email) {
        if (!isGoogleEmailVerified(profile)) {
          return customerToken;
        }

        try {
          const customer = await upsertCustomerFromGoogle({
            email: profile.email,
            name: typeof profile.name === "string" ? profile.name : null,
            image:
              typeof profile.picture === "string" ? profile.picture : null,
            providerAccountId: account.providerAccountId,
            emailVerified: true,
          });

          customerToken.customerId = customer.id;
          customerToken.email = customer.email;
          customerToken.name = customer.name;
          customerToken.picture = customer.image;
        } catch (error) {
          console.error("JWT customer sync failed:", error);
        }
      }

      return customerToken;
    },

    async session({ session, token }) {
      const customerToken = token as CustomerJWT;
      if (session.user) {
        session.user.id =
          typeof customerToken.customerId === "string"
            ? customerToken.customerId
            : typeof customerToken.sub === "string"
              ? customerToken.sub
              : "";
        if (typeof customerToken.email === "string") {
          session.user.email = customerToken.email;
        }
        if (
          typeof customerToken.name === "string" ||
          customerToken.name === null
        ) {
          session.user.name = customerToken.name as string | null;
        }
        if (
          typeof customerToken.picture === "string" ||
          customerToken.picture === null
        ) {
          session.user.image = customerToken.picture as string | null;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        // fall through
      }
      return `${baseUrl}/account`;
    },
  },
});
