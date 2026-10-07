import { NextResponse } from "next/server";
import {
  GENERIC_PASSWORD_RESET_INVALID_MESSAGE,
  passwordResetSchema,
} from "@/app/lib/customer-password-reset-pure";
import { resetCustomerPassword } from "@/app/lib/customer-password-reset";

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: GENERIC_PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: GENERIC_PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: GENERIC_PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
  }

  const parsed = passwordResetSchema.safeParse(body);
  if (!parsed.success) {
    const token = typeof body === "object" && body !== null && "token" in body
      ? (body as { token?: unknown }).token
      : null;
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json({ error: GENERIC_PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Use a matching password between 15 and 128 characters." },
      { status: 400 },
    );
  }

  try {
    const reset = await resetCustomerPassword(parsed.data);
    if (!reset) {
      return NextResponse.json({ error: GENERIC_PASSWORD_RESET_INVALID_MESSAGE }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to reset your password right now. Please try again." },
      { status: 503 },
    );
  }
}
