import { NextResponse } from "next/server";
import { getCustomerSessionAuthContext, isTrustedAccountActionRequest } from "@/app/lib/account-security";
import { trustedClientIp } from "@/app/lib/auth-rate-limit-pure";
import { checkAuthRateLimit } from "@/app/lib/auth-rate-limit";
import { addPasswordSchema } from "@/app/lib/customer-auth-linking-pure";
import { addPasswordMethod } from "@/app/lib/customer-auth-linking";

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  if (!isTrustedAccountActionRequest(request)) return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  const context = await getCustomerSessionAuthContext(request);
  if (!context) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (context.authMethod !== "google") return NextResponse.json({ error: "Use a Google account session to add password sign-in." }, { status: 403 });

  const clientIp = trustedClientIp(request.headers, process.env.VERCEL === "1");
  try {
    const limit = await checkAuthRateLimit({ action: "password_method_add", email: context.email, clientIp });
    if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  } catch {
    return NextResponse.json({ error: "Unable to process this request right now." }, { status: 503 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Enter a valid password." }, { status: 400 });
  }
  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Enter a valid password." }, { status: 400 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Enter a valid password." }, { status: 400 });
  }
  if (!addPasswordSchema.safeParse(body).success) return NextResponse.json({ error: "Use a matching password between 15 and 128 characters." }, { status: 400 });

  const result = await addPasswordMethod(context.customerId, body);
  if (result.ok) return NextResponse.json({ success: true });
  if (result.reason === "exists") return NextResponse.json({ error: "Password sign-in is already enabled." }, { status: 409 });
  if (result.reason === "unverified") return NextResponse.json({ error: "Verify your account email before adding password sign-in." }, { status: 403 });
  return NextResponse.json({ error: "Enter a valid password." }, { status: 400 });
}
