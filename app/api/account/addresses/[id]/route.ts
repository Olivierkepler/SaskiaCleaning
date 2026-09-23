import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@/app/lib/customer-profile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await updateCustomerAddress(customer.id, id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    address: {
      id: result.address.id,
      label: result.address.label,
      addressLine1: result.address.addressLine1,
      addressLine2: result.address.addressLine2,
      city: result.address.city,
      state: result.address.state,
      postalCode: result.address.postalCode,
      country: result.address.country,
      isDefault: result.address.isDefault,
    },
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const result = await deleteCustomerAddress(customer.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
