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

  return prisma.$transaction(async (transaction) => {
    const current = await transaction.order.findUnique({
      where: { id: orderId },
      select: {
        status: true, branchId: true, payment: { select: { status: true } },
        items: { select: { quantity: true, product: { select: { recipeItems: { select: { ingredientId: true, quantity: true } } } } } },
      },
    });
    if (!current) throw new OrderServiceError("ORDER_NOT_FOUND", 404, "Không tìm thấy order.");
    if (!allowedTransitions[current.status].includes(parsed.data.status)) {
      throw new OrderServiceError("INVALID_STATUS_TRANSITION", 409, "Order đã được cập nhật ở màn hình khác. Danh sách sẽ được tải lại.");
    }
    if (parsed.data.status === "CANCELLED" && current.payment?.status === "PAID") {
      throw new OrderServiceError("PAID_ORDER_CANNOT_BE_CANCELLED", 409, "Order đã thanh toán. Chủ quán cần hủy thanh toán trước.");
    }

    const now = new Date();
    const result = await transaction.order.updateMany({
      where: { id: orderId, status: current.status },
      data: {
        status: parsed.data.status, statusUpdatedAt: now,
        servedAt: parsed.data.status === "SERVED" ? now : undefined,
        cancelledAt: parsed.data.status === "CANCELLED" ? now : undefined,
        cancellationReason: parsed.data.status === "CANCELLED" ? parsed.data.cancellationReason : undefined,
      },
    });
    if (result.count !== 1) throw new OrderServiceError("STATUS_UPDATE_CONFLICT", 409, "Order vừa được cập nhật ở màn hình khác. Vui lòng thử lại.");

    if (parsed.data.status === "SERVED") {
      const consumption = new Map<string, number>();
      for (const item of current.items) for (const recipe of item.product.recipeItems) {
        consumption.set(recipe.ingredientId, (consumption.get(recipe.ingredientId) ?? 0) + recipe.quantity * item.quantity);
      }
      let costAmount = 0;
      for (const [ingredientId, quantity] of [...consumption.entries()].sort(([left], [right]) => left.localeCompare(right))) {
        await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${ingredientId}))::text`;
        const ingredient = await transaction.ingredient.findUniqueOrThrow({ where: { id: ingredientId } });
        const balanceAfter = ingredient.currentQuantity - quantity;
        const totalCost = quantity * ingredient.costPerUnit;
        await transaction.ingredient.update({ where: { id: ingredientId }, data: { currentQuantity: balanceAfter } });
        await transaction.stockMovement.create({ data: {
          branchId: current.branchId, ingredientId, orderId, type: "CONSUMPTION", quantity: -quantity,
          balanceAfter, unitCost: ingredient.costPerUnit, totalCost, note: "Tự động xuất kho khi phục vụ order",
        } });
        costAmount += totalCost;
      }
      await transaction.order.update({ where: { id: orderId }, data: { costAmount } });
    }
    return transaction.order.findUniqueOrThrow({ where: { id: orderId }, select: { id: true, orderNo: true, status: true, statusUpdatedAt: true } });
  });
}
