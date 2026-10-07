import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCustomerEmailToken } from "@/app/lib/customer-email-verification";

const tokenSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
}).strict();
const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "This verification link is invalid or expired." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "This verification link is invalid or expired." },
        { status: 400 },
      );
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "This verification link is invalid or expired." },
      { status: 400 },
    );
  }

  const parsed = tokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "This verification link is invalid or expired." },
      { status: 400 },
    );
  }

  try {
    const verified = await verifyCustomerEmailToken(parsed.data.token);
    if (!verified) {
      return NextResponse.json(
        { error: "This verification link is invalid or expired." },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify this email right now. Please try again." },
      { status: 503 },
    );
  }
}
