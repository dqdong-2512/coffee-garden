import { getOrderReceipt } from "@/features/orders/queries/get-order-receipt";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const tableCode = new URL(request.url).searchParams.get("tableCode") ?? "";
    const { orderId } = await params;
    const order = await getOrderReceipt(tableCode, orderId);
    if (!order) {
      return Response.json(
        { code: "ORDER_NOT_FOUND", error: "Không tìm thấy order." },
        { status: 404 },
      );
    }
    return Response.json(
      { order },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { code: "ORDER_LOOKUP_FAILED", error: "Không thể cập nhật trạng thái order." },
      { status: 503 },
    );
  }
}
