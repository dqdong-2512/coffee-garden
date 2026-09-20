import { PaymentError, recordPayment } from "@/features/payments/services/payment-service";
import { authorizeRequest } from "@/lib/auth/authorization";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, ["ORDER"]);
  if (auth.response) return auth.response;
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return Response.json({ error: "Dữ liệu phải có định dạng JSON." }, { status: 415 });
    }
    const result = await recordPayment(await request.json(), auth.user.id);
    return Response.json(result, { status: result.replayed ? 200 : 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    if (error instanceof PaymentError) return Response.json({ code: error.code, error: error.message }, { status: error.status });
    return Response.json({ error: "Không thể ghi nhận thanh toán." }, { status: 503 });
  }
}
