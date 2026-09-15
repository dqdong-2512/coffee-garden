import { prisma } from "@/lib/db/prisma";
import { paymentSchema, voidPaymentSchema } from "../validation";

export class PaymentError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export async function recordPayment(raw: unknown, createdById: string) {
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new PaymentError("INVALID_PAYMENT", parsed.error.issues[0]?.message ?? "Thanh toán không hợp lệ.");
  }
  const input = parsed.data;
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${input.orderId}))::text`;
    const order = await transaction.order.findUnique({
      where: { id: input.orderId },
      include: { payment: true, branch: { select: { isActive: true } } },
    });
    if (!order || !order.branch.isActive) {
      throw new PaymentError("ORDER_NOT_FOUND", "Không tìm thấy order.", 404);
    }
    if (order.status === "CANCELLED") {
      throw new PaymentError("ORDER_CANCELLED", "Order đã hủy nên không thể thanh toán.", 409);
    }
    if (order.payment?.status === "PAID") {
      if (order.payment.method !== input.method) {
        throw new PaymentError(
          "PAYMENT_ALREADY_RECORDED",
          "Order đã được ghi nhận bằng phương thức thanh toán khác.",
          409,
        );
      }
      return { payment: order.payment, replayed: true };
    }
    const data = {
      branchId: order.branchId,
      createdById,
      method: input.method,
      amount: order.totalAmount,
      reference: input.reference || null,
      note: input.note || null,
      status: "PAID" as const,
      voidedAt: null,
      voidReason: null,
      receivedAt: new Date(),
    };
    const payment = order.payment
      ? await transaction.payment.update({ where: { id: order.payment.id }, data })
      : await transaction.payment.create({ data: { ...data, orderId: order.id } });
    return { payment, replayed: false };
  });
}

export async function voidPayment(paymentId: string, raw: unknown) {
  const parsed = voidPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new PaymentError("INVALID_VOID", parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  const current = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!current) throw new PaymentError("PAYMENT_NOT_FOUND", "Không tìm thấy thanh toán.", 404);
  if (current.status === "VOIDED") return current;
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "VOIDED", voidedAt: new Date(), voidReason: parsed.data.reason },
  });
}
