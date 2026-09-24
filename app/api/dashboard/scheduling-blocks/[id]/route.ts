import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { deleteSchedulingBlock } from "@/app/lib/scheduling";


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;


  try {
    const { id } = await context.params;
    const blockId = Number(id);
    if (!Number.isInteger(blockId) || blockId <= 0) {
      return NextResponse.json({ error: "Invalid block id." }, { status: 400 });
    }

    const deleted = await deleteSchedulingBlock(blockId);
    if (!deleted) {
      return NextResponse.json({ error: "Block not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete block." },
      { status: 500 },
    );
  }
}
