import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { kitchenStatusSchema } from "../validation/kitchen-status";
import { OrderServiceError } from "./order-errors";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PREPARING", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["SERVED", "CANCELLED"],
  SERVED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(orderId: string, rawInput: unknown) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    throw new OrderServiceError("INVALID_ORDER_ID", 400, "Mã order không hợp lệ.");
  }
  const parsed = kitchenStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new OrderServiceError(
      "INVALID_STATUS_UPDATE",
      400,
      parsed.error.issues[0]?.message ?? "Trạng thái không hợp lệ.",
    );
  }

  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, payment: { select: { status: true } } },
  });
  if (!current) {
    throw new OrderServiceError("ORDER_NOT_FOUND", 404, "Không tìm thấy order.");
  }
  if (!allowedTransitions[current.status].includes(parsed.data.status)) {
    throw new OrderServiceError(
      "INVALID_STATUS_TRANSITION",
      409,
      "Order đã được cập nhật ở màn hình khác. Danh sách sẽ được tải lại.",
    );
  }
  if (parsed.data.status === "CANCELLED" && current.payment?.status === "PAID") {
    throw new OrderServiceError(
      "PAID_ORDER_CANNOT_BE_CANCELLED",
      409,
      "Order đã thanh toán. Chủ quán cần hủy thanh toán trước.",
    );
  }

  const now = new Date();
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: current.status },
    data: {
      status: parsed.data.status,
      statusUpdatedAt: now,
      servedAt: parsed.data.status === "SERVED" ? now : undefined,
      cancelledAt: parsed.data.status === "CANCELLED" ? now : undefined,
      cancellationReason:
        parsed.data.status === "CANCELLED"
          ? parsed.data.cancellationReason
          : undefined,
    },
  });
  if (result.count !== 1) {
    throw new OrderServiceError(
      "STATUS_UPDATE_CONFLICT",
      409,
      "Order vừa được cập nhật ở màn hình khác. Vui lòng thử lại.",
    );
  }

  return prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, orderNo: true, status: true, statusUpdatedAt: true },
  });
}
