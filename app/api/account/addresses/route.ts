import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import {
  createCustomerAddress,
  listCustomerAddresses,
} from "@/app/lib/customer-profile";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await listCustomerAddresses(customer.id);
  return NextResponse.json({
    addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    })),
  });
}

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createCustomerAddress(customer.id, body);
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
