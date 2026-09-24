import { NextResponse } from "next/server";
import { requireOwnerApi } from "@/app/lib/admin-auth";
import {
  createAdminUser,
  listAdminUsers,
  serializeAdminUser,
} from "@/app/lib/admin-users";

export async function GET() {
  const gate = await requireOwnerApi();
  if (!gate.ok) return gate.response;

  try {
    const admins = await listAdminUsers();
    return NextResponse.json({
      admins: admins.map(serializeAdminUser),
    });
  } catch (error) {
    console.error("Failed to list admins:", error);
    return NextResponse.json(
      { error: "Failed to load admins." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireOwnerApi();
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
  // Ignore any client-supplied authorization fields.
  void record.isOwner;
  void record.actorEmail;
  void record.roleSpoof;

  const result = await createAdminUser({
    email: typeof record.email === "string" ? record.email : "",
    name: typeof record.name === "string" ? record.name : null,
    role: record.role,
    createdByAdminId: gate.admin.id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      admin: serializeAdminUser(result.admin),
      message:
        "Admin added. They can now sign in with Google using this email.",
    },
    { status: 201 },
  );
}
