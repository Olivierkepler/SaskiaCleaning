import { NextResponse } from "next/server";
import { requireOwnerApi } from "@/app/lib/admin-auth";
import {
  changeAdminRole,
  serializeAdminUser,
  setAdminActive,
  updateAdminName,
} from "@/app/lib/admin-users";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const gate = await requireOwnerApi();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid admin id." }, { status: 400 });
  }

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
  // Client cannot spoof actor identity/role.
  void record.actorId;
  void record.actorEmail;
  void record.isOwner;

  const action = record.action;

  if (action === "deactivate") {
    const result = await setAdminActive({
      actorId: gate.admin.id,
      targetId: id,
      isActive: false,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ admin: serializeAdminUser(result.admin) });
  }

  if (action === "activate") {
    const result = await setAdminActive({
      actorId: gate.admin.id,
      targetId: id,
      isActive: true,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ admin: serializeAdminUser(result.admin) });
  }

  if (action === "change_role") {
    const result = await changeAdminRole({
      actorId: gate.admin.id,
      targetId: id,
      role: record.role,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ admin: serializeAdminUser(result.admin) });
  }

  if (action === "update_name") {
    const result = await updateAdminName({
      actorId: gate.admin.id,
      targetId: id,
      name: typeof record.name === "string" ? record.name : null,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ admin: serializeAdminUser(result.admin) });
  }

  return NextResponse.json(
    {
      error:
        'Unsupported action. Use "activate", "deactivate", "change_role", or "update_name".',
    },
    { status: 400 },
  );
}
