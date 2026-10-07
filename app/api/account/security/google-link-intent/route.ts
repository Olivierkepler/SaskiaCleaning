import { NextResponse } from "next/server";
import { getCustomerSessionAuthContext, isTrustedAccountActionRequest } from "@/app/lib/account-security";
import { trustedClientIp } from "@/app/lib/auth-rate-limit-pure";
import { checkAuthRateLimit } from "@/app/lib/auth-rate-limit";
import { authSessionCookiePairsFromHeader, GOOGLE_LINK_INTENT_COOKIE, hashAuthSessionCookies } from "@/app/lib/customer-auth-linking-pure";
import { createGoogleLinkIntent } from "@/app/lib/customer-auth-linking";
import { sql } from "@/app/lib/db";

export async function POST(request: Request) {
  if (!isTrustedAccountActionRequest(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const context = await getCustomerSessionAuthContext(request);
  if (!context) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (context.authMethod !== "credentials") return NextResponse.json({ error: "Use a password account session to connect Google." }, { status: 403 });

  const clientIp = trustedClientIp(request.headers, process.env.VERCEL === "1");
  try {
    const limit = await checkAuthRateLimit({ action: "google_link_intent", email: context.email, clientIp });
    if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  } catch {
    return NextResponse.json({ error: "Unable to process this request right now." }, { status: 503 });
  }

  const sessionBindingHash = hashAuthSessionCookies(authSessionCookiePairsFromHeader(request.headers.get("cookie")));
  if (!sessionBindingHash) return NextResponse.json({ error: "Sign in again before connecting Google." }, { status: 401 });
  const methods = await sql`
    SELECT customer.email_verified,
      EXISTS (SELECT 1 FROM customer_oauth_accounts WHERE customer_id = customer.id AND provider = 'google') AS google_connected
    FROM customers AS customer WHERE customer.id = ${context.customerId} LIMIT 1
  `;
  const row = methods[0] as { email_verified: Date | string | null; google_connected: boolean } | undefined;
  if (!row?.email_verified) return NextResponse.json({ error: "Verify your account email before connecting Google." }, { status: 403 });
  if (row.google_connected) return NextResponse.json({ error: "Google is already connected." }, { status: 409 });

  try {
    const issued = await createGoogleLinkIntent({ customerId: context.customerId, sessionBindingHash });
    const response = NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
    response.cookies.set(GOOGLE_LINK_INTENT_COOKIE, issued.nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/callback/google",
      expires: issued.expiresAt,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to start Google linking right now." }, { status: 503 });
  }
}
