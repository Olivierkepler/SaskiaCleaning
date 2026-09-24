import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import {
  createSchedulingBlock,
  listBlocksInRange,
} from "@/app/lib/scheduling";
import {
  getZonedDateParts,
  isValidBookingDateOnly,
  SASKIA_TIME_ZONE,
} from "@/app/lib/scheduling-pure";



export async function GET(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const url = new URL(req.url);
    const today = getZonedDateParts(new Date(), SASKIA_TIME_ZONE).dateOnly;
    const from = url.searchParams.get("from") ?? today;
    const to = url.searchParams.get("to") ?? from;

    if (!isValidBookingDateOnly(from) || !isValidBookingDateOnly(to)) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    }

    const blocks = await listBlocksInRange(from, to);
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load blocks." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const result = await createSchedulingBlock({
      blockDate: body?.blockDate,
      startTime: body?.startTime ?? null,
      endTime: body?.endTime ?? null,
      reason: body?.reason ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create block." },
      { status: 500 },
    );
  }
}
