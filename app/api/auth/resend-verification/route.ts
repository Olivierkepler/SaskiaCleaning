import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";
import { resendCustomerVerificationEmail } from "@/app/lib/customer-email-verification";
import { checkAuthRateLimit } from "@/app/lib/auth-rate-limit";
import { trustedClientIp } from "@/app/lib/auth-rate-limit-pure";
import { GENERIC_VERIFICATION_RESEND_MESSAGE } from "@/app/lib/customer-email-verification-pure";

const MAX_BODY_BYTES = 4096;
const GENERIC_RESPONSE = {
  message: GENERIC_VERIFICATION_RESEND_MESSAGE,
};
const emailSchema = z.object({
  email: z.string().trim().min(1).max(254).email(),
}).strict();

function rateLimitError(retryAfterSeconds = 3600) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const clientIp = trustedClientIp(request.headers, process.env.VERCEL === "1");

  try {
    const networkLimit = await checkAuthRateLimit({
      action: "verification_resend",
      email: null,
      clientIp,
      scopes: ["network"],
    });
    if (!networkLimit.allowed) return rateLimitError(networkLimit.retryAfterSeconds ?? 3600);
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request right now. Please try again later." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json(GENERIC_RESPONSE, { status: 202 });

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  }

  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  const email = normalizeCustomerEmail(parsed.data.email);

  try {
    const emailLimit = await checkAuthRateLimit({
      action: "verification_resend",
      email,
      clientIp,
      scopes: ["email_ip"],
    });
    if (!emailLimit.allowed) return rateLimitError(emailLimit.retryAfterSeconds ?? 3600);
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request right now. Please try again later." },
      { status: 503 },
    );
  }

  try {
    await resendCustomerVerificationEmail(email);
  } catch {
    // Keep the same response for unknown, verified, Google-only, and delivery-failure cases.
  }
  return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
}
