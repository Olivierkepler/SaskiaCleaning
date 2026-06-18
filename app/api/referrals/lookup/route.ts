import { NextResponse } from "next/server";
import {
  lookupReferrerPortal,
  parseReferralLookupInput,
} from "../../../lib/referral-portal";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parseReferralLookupInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await lookupReferrerPortal(parsed.data);

    if (!result.found) {
      return NextResponse.json({
        success: true,
        found: false,
        message: result.message,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      codes: result.codes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to look up referral status." },
      { status: 500 },
    );
  }
}
