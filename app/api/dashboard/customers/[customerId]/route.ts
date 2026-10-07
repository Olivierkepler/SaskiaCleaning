import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { updateAdminCustomerProfile } from "@/app/lib/customer-profile";
import { executeAdminCustomerProfilePatch } from "@/app/lib/customer-profile-pure";

export async function PATCH(
  request: Request,
  context: { params: Promise<unknown> },
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const customerId =
    params && typeof params === "object" && "customerId" in params
      ? String(params.customerId)
      : "";
  if (!customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await executeAdminCustomerProfilePatch(body, {
    authorized: true,
    update: (patch) => updateAdminCustomerProfile(customerId, patch),
  });

  if (result.status !== 200) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    success: true,
    profile: {
      id: result.profile.id,
      name: result.profile.name,
      phone: result.profile.phone,
    },
  });
}
