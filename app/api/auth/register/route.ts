import { NextResponse } from "next/server";
import {
  createRegisteredCustomer,
  CustomerRegistrationConflictError,
} from "@/app/lib/customer-credentials";
import { registrationSchema } from "@/app/lib/customer-credentials-pure";

const MAX_BODY_BYTES = 16_384;
const GENERIC_REGISTRATION_ERROR = "Unable to create account. Please check your details and try again.";

export async function POST(request: Request) {
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

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: GENERIC_REGISTRATION_ERROR },
      { status: 400 },
    );
  }

  try {
    // Shared distributed throttling must be inserted here before production.
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
