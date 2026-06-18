import { NextResponse } from "next/server";
import {
  markReferralPortalTokenUsed,
  verifyReferralPortalToken,
} from "../../../lib/referral-portal-auth";
import { lookupReferrerPortal } from "../../../lib/referral-portal";

const GENERIC_PORTAL_ERROR = "Invalid or expired access link.";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ error: GENERIC_PORTAL_ERROR }, { status: 401 });
    }

    const verified = await verifyReferralPortalToken(token);
    if (!verified) {
      return NextResponse.json({ error: GENERIC_PORTAL_ERROR }, { status: 401 });
    }

    const result = await lookupReferrerPortal({
      email: verified.email,
      code: verified.code,
    });

    if (!result.found) {
      return NextResponse.json({ error: GENERIC_PORTAL_ERROR }, { status: 401 });
    }

    await markReferralPortalTokenUsed(verified.id);

    return NextResponse.json({
      success: true,
      found: true,
      codes: result.codes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load referral portal data." },
      { status: 500 },
    );
  }
}
