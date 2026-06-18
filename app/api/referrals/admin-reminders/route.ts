import { NextResponse } from "next/server";
import { sendOutstandingRewardsSummary } from "../../../lib/admin-referral-reminders";
import { isDashboardAuthorized } from "../../../lib/referrals";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const action =
      typeof body === "object" &&
      body !== null &&
      "action" in body &&
      typeof (body as { action: unknown }).action === "string"
        ? (body as { action: string }).action
        : null;

    if (action !== "summary") {
      return NextResponse.json(
        { error: 'Unsupported action. Use action="summary".' },
        { status: 400 },
      );
    }

    const result = await sendOutstandingRewardsSummary();

    return NextResponse.json({
      success: true,
      notification: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to send admin referral reminder." },
      { status: 500 },
    );
  }
}
