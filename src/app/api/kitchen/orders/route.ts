import { listKitchenOrders } from "@/features/orders/queries/list-kitchen-orders";
import { authorizeRequest } from "@/lib/auth/authorization";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, ["OWNER", "KITCHEN"]);
  if (auth.response) return auth.response;
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
