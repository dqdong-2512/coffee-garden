import { listKitchenOrders } from "@/features/orders/queries/list-kitchen-orders";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(
      { orders: await listKitchenOrders(), serverTime: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { code: "KITCHEN_UNAVAILABLE", error: "Không thể tải danh sách order." },
      { status: 503 },
    );
  }
}
