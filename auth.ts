import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "@auth/core/jwt";
import {
  isGoogleEmailVerified,
  upsertCustomerFromGoogle,
  linkGuestBookingsByEmail,
} from "@/app/lib/customer-identity";
import { findActiveStaffByEmail } from "@/app/lib/staff";
import {
  STAFF_AUTH_PORTAL_COOKIE,
  STAFF_AUTH_PORTAL_VALUE,
} from "@/app/lib/staff-pure";
import { cookies } from "next/headers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    /** Present only for allowlisted active staff. Revalidated on each requireStaff(). */
    staffId?: string | null;
  }
}

type AppJWT = JWT & {
  customerId?: string;
  staffId?: string;
};

async function readStaffPortalIntent(): Promise<boolean> {
  try {
    const jar = await cookies();
    return jar.get(STAFF_AUTH_PORTAL_COOKIE)?.value === STAFF_AUTH_PORTAL_VALUE;
  } catch {
    return false;
  }
}

async function clearStaffPortalIntent(): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(STAFF_AUTH_PORTAL_COOKIE);
  } catch {
    // ignore
  }
}

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

      const staffIntent = await readStaffPortalIntent();
      // Always clear so abandoned staff intents cannot poison customer login.
      await clearStaffPortalIntent();

      if (staffIntent) {
        const staff = await findActiveStaffByEmail(email);
        if (!staff) {
          return "/staff/login?error=not_staff";
        }
        // Staff allowlist only — do not auto-provision customers on staff login.
        return true;
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
      const appToken = token as AppJWT;

      if (account?.provider === "google" && profile?.email) {
        if (!isGoogleEmailVerified(profile)) {
          return appToken;
        }

        const email = profile.email;

        try {
          const staff = await findActiveStaffByEmail(email);
          if (staff) {
            appToken.staffId = staff.id;
            appToken.email = staff.email;
            appToken.name = staff.name;
          } else {
            delete appToken.staffId;
          }
        } catch (error) {
          console.error("JWT staff sync failed:", error);
        }

        // Customer upsert only when this Google account already maps / should map
        // to a customer. Staff-only accounts skip customer provisioning.
        // If a customer row already exists for this email, attach customerId.
        try {
          const { findCustomerByEmail, upsertCustomerFromGoogle } = await import(
            "@/app/lib/customer-identity"
          );
          const existingCustomer = await findCustomerByEmail(email);

          if (existingCustomer) {
            // Refresh customer linkage without inventing preferred-name overwrites.
            const customer = await upsertCustomerFromGoogle({
              email,
              name: typeof profile.name === "string" ? profile.name : null,
              image:
                typeof profile.picture === "string" ? profile.picture : null,
              providerAccountId: account.providerAccountId,
              emailVerified: true,
            });
            appToken.customerId = customer.id;
            if (!appToken.staffId) {
              appToken.email = customer.email;
              appToken.name = customer.name;
              appToken.picture = customer.image;
            }
          } else if (!appToken.staffId) {
            // Pure customer login path (no staff record): create/link customer.
            const customer = await upsertCustomerFromGoogle({
              email,
              name: typeof profile.name === "string" ? profile.name : null,
              image:
                typeof profile.picture === "string" ? profile.picture : null,
              providerAccountId: account.providerAccountId,
              emailVerified: true,
            });
            appToken.customerId = customer.id;
            appToken.email = customer.email;
            appToken.name = customer.name;
            appToken.picture = customer.image;
          }
        } catch (error) {
          console.error("JWT customer sync failed:", error);
        }
      }

      // On subsequent requests, drop staffId if staff was deactivated.
      if (appToken.staffId && !account) {
        try {
          const { findStaffById } = await import("@/app/lib/staff");
          const staff = await findStaffById(appToken.staffId);
          if (!staff?.isActive) {
            delete appToken.staffId;
          }
        } catch {
          // keep token; requireStaff will re-check
        }
      }

      return appToken;
    },

    async session({ session, token }) {
      const appToken = token as AppJWT;
      if (session.user) {
        session.user.id =
          typeof appToken.customerId === "string"
            ? appToken.customerId
            : "";
        if (typeof appToken.email === "string") {
          session.user.email = appToken.email;
        }
        if (
          typeof appToken.name === "string" ||
          appToken.name === null
        ) {
          session.user.name = appToken.name as string | null;
        }
        if (
          typeof appToken.picture === "string" ||
          appToken.picture === null
        ) {
          session.user.image = appToken.picture as string | null;
        }
      }
      session.staffId =
        typeof appToken.staffId === "string" ? appToken.staffId : null;
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
