import { NextResponse } from "next/server";
import {
  deleteServiceDurationRule,
  listServiceDurationRules,
  upsertServiceDurationRule,
} from "@/app/lib/booking-duration";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertKey(req: Request): boolean {
  return new URL(req.url).searchParams.get("key") === process.env.DASHBOARD_KEY;
}

export async function GET(req: Request) {
  if (!assertKey(req)) return unauthorized();
  try {
    const rules = await listServiceDurationRules();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load duration rules." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  if (!assertKey(req)) return unauthorized();
  try {
    const body = await req.json();
    const result = await upsertServiceDurationRule({
      id: typeof body?.id === "number" ? body.id : undefined,
      serviceKey: String(body?.serviceKey ?? ""),
      durationMinutes: Number(body?.durationMinutes),
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ rule: result.rule });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save duration rule." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!assertKey(req)) return unauthorized();
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "id required." }, { status: 400 });
    }
    const ok = await deleteServiceDurationRule(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete duration rule." },
      { status: 500 },
    );
  }
}
