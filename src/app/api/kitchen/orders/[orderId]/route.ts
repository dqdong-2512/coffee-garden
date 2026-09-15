import { OrderServiceError } from "@/features/orders/services/order-errors";
import { updateOrderStatus } from "@/features/orders/services/update-order-status";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json(
        { code: "INVALID_ORIGIN", error: "Không thể cập nhật từ địa chỉ này." },
        { status: 403 },
      );
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return Response.json(
        { code: "INVALID_CONTENT_TYPE", error: "Dữ liệu không hợp lệ." },
        { status: 415 },
      );
    }

    const { orderId } = await params;
    const order = await updateOrderStatus(orderId, await request.json());
    return Response.json(
      { order: { ...order, statusUpdatedAt: order.statusUpdatedAt.toISOString() } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { code: "INVALID_JSON", error: "Dữ liệu không hợp lệ." },
        { status: 400 },
      );
    }
    if (error instanceof OrderServiceError) {
      return Response.json(
        { code: error.code, error: error.message },
        { status: error.status },
      );
    }
    return Response.json(
      { code: "STATUS_UPDATE_FAILED", error: "Không thể cập nhật order." },
      { status: 503 },
    );
  }
}
