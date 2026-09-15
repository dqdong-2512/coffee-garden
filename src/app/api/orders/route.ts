import { createCustomerOrder } from "@/features/orders/services/create-customer-order";
import { OrderServiceError } from "@/features/orders/services/order-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json(
        { code: "INVALID_ORIGIN", error: "Không thể gửi order từ địa chỉ này." },
        { status: 403 },
      );
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return Response.json(
        { code: "INVALID_CONTENT_TYPE", error: "Dữ liệu order không hợp lệ." },
        { status: 415 },
      );
    }

    const declaredSize = Number(request.headers.get("content-length") ?? 0);
    if (declaredSize > 16_000) {
      return Response.json(
        { code: "REQUEST_TOO_LARGE", error: "Dữ liệu order quá dài." },
        { status: 413 },
      );
    }

    const result = await createCustomerOrder(await request.json());
    return Response.json(result, {
      status: result.replayed ? 200 : 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { code: "INVALID_JSON", error: "Dữ liệu order không hợp lệ." },
        { status: 400 },
      );
    }
    if (error instanceof OrderServiceError) {
      return Response.json(
        { code: error.code, error: error.message },
        { status: error.status },
      );
    }
    console.error(
      "Unexpected order creation failure",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      {
        code: "ORDER_FAILED",
        error: "Không thể gửi order. Vui lòng thử lại hoặc gọi nhân viên.",
      },
      { status: 503 },
    );
  }
}
