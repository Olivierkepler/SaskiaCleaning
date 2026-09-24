import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import {
  approveBookingChangeRequest,
  listPendingAdminChangeRequests,
  rejectBookingChangeRequest,
} from "@/app/lib/booking-change-requests";

export async function GET(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const requests = await listPendingAdminChangeRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Failed to list booking change requests");
    void error;
    return NextResponse.json(
      { error: "Failed to load change requests." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const requestId = Number(record.requestId);
  const action = record.action;

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return NextResponse.json({ error: "Invalid request ID." }, { status: 400 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const customerMessage =
    typeof record.customerMessage === "string"
      ? record.customerMessage
      : null;
  const adminNote =
    typeof record.adminNote === "string" ? record.adminNote : null;

  const result =
    action === "approve"
      ? await approveBookingChangeRequest({
          requestId,
          customerMessage,
        })
      : await rejectBookingChangeRequest({
          requestId,
          customerMessage,
          adminNote,
        });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    request: result.request,
  });
}
