import { NextResponse } from "next/server";
import {
  createRegisteredCustomer,
  CustomerRegistrationConflictError,
} from "@/app/lib/customer-credentials";
import { registrationSchema } from "@/app/lib/customer-credentials-pure";
import {
  AuthRateLimitUnavailableError,
  checkAuthRateLimit,
} from "@/app/lib/auth-rate-limit";
import { trustedClientIp } from "@/app/lib/auth-rate-limit-pure";

const MAX_BODY_BYTES = 16_384;
const GENERIC_REGISTRATION_ERROR = "Unable to create account. Please check your details and try again.";
const RATE_LIMIT_ERROR = "Too many attempts. Please try again later.";

function throttledResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: RATE_LIMIT_ERROR },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const clientIp = trustedClientIp(request.headers, process.env.VERCEL === "1");

  try {
    const networkLimit = await checkAuthRateLimit({
      action: "registration",
      email: null,
      clientIp,
      scopes: ["network"],
    });
    if (!networkLimit.allowed) {
      return throttledResponse(networkLimit.retryAfterSeconds ?? 1);
    }
  } catch (error) {
    if (error instanceof AuthRateLimitUnavailableError) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 503 });
    }
    return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: GENERIC_REGISTRATION_ERROR }, { status: 400 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: GENERIC_REGISTRATION_ERROR }, { status: 400 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: GENERIC_REGISTRATION_ERROR }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? (body as { email?: unknown }).email
      : null;
  try {
    const emailIpLimit = await checkAuthRateLimit({
      action: "registration",
      email,
      clientIp,
      scopes: ["email_ip"],
    });
    if (!emailIpLimit.allowed) {
      return throttledResponse(emailIpLimit.retryAfterSeconds ?? 1);
    }
  } catch {
    return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 503 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: GENERIC_REGISTRATION_ERROR },
      { status: 400 },
    );
  }

  try {
    await createRegisteredCustomer(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof CustomerRegistrationConflictError) {
      return NextResponse.json(
        { error: GENERIC_REGISTRATION_ERROR },
        { status: 400 },
      );
    }
    console.error("Customer registration failed.");
    return NextResponse.json(
      { error: "Unable to create account right now. Please try again." },
      { status: 500 },
    );
  }
}
