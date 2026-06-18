import { NextResponse } from "next/server";
import {
  createReferralPortalToken,
  buildReferralPortalMagicLink,
  sendReferralPortalMagicLink,
} from "../../../lib/referral-portal-auth";
import {
  lookupReferrerPortal,
  parseReferralLookupInput,
} from "../../../lib/referral-portal";

const GENERIC_LOOKUP_MESSAGE =
  "If referral rewards exist for that email, we sent a secure access link.";

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

    if (result.found) {
      try {
        const { token } = await createReferralPortalToken(
          parsed.data.email,
          parsed.data.code,
        );
        const magicLink = buildReferralPortalMagicLink(token);
        await sendReferralPortalMagicLink(parsed.data.email, magicLink);
      } catch (error) {
        console.error("Failed to send referral portal magic link:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_LOOKUP_MESSAGE,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to process referral portal request." },
      { status: 500 },
    );
  }
}
