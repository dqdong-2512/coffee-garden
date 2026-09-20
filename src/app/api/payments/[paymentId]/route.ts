import { PaymentError, voidPayment } from "@/features/payments/services/payment-service";
import { authorizeRequest } from "@/lib/auth/authorization";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const auth = await authorizeRequest(request, ["AUDIT"]);
  if (auth.response) return auth.response;
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
    }
    const { paymentId } = await params;
    return Response.json({ payment: await voidPayment(paymentId, await request.json()) });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    if (error instanceof PaymentError) return Response.json({ code: error.code, error: error.message }, { status: error.status });
    return Response.json({ error: "Không thể hủy thanh toán." }, { status: 503 });
  }
}
