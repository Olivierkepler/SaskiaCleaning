import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import { setDefaultCustomerAddress } from "@/app/lib/customer-profile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: Request, context: RouteContext) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const result = await setDefaultCustomerAddress(customer.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    address: {
      id: result.address.id,
      label: result.address.label,
      isDefault: result.address.isDefault,
    },
  });
}
