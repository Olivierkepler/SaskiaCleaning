import { NextResponse } from "next/server";
import { deleteSchedulingBlock } from "@/app/lib/scheduling";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== process.env.DASHBOARD_KEY) {
    return unauthorized();
  }

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
