import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { listAdminOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const orders = await listAdminOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not load orders.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
