import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/app/lib/customer-profile";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCustomerProfile(customer.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      image: profile.image,
    },
  });
}

export async function PATCH(req: Request) {
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

  // Ignore any client-supplied customerId / email / image
  const result = await updateCustomerProfile(customer.id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    profile: {
      id: result.profile.id,
      email: result.profile.email,
      name: result.profile.name,
      phone: result.profile.phone,
      image: result.profile.image,
    },
  });
}
