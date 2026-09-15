import { prisma } from "@/lib/db/prisma";
import type { KitchenOrder } from "../types";

export async function listKitchenOrders(): Promise<KitchenOrder[]> {
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } },
        {
          status: "SERVED",
          statusUpdatedAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        },
      ],
    },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      status: true,
      customerNote: true,
      cancellationReason: true,
      createdAt: true,
      statusUpdatedAt: true,
      table: { select: { code: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productName: true,
          quantity: true,
          itemNote: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    tableCode: order.table.code,
    tableName: order.table.name,
    customerNote: order.customerNote,
    cancellationReason: order.cancellationReason,
    createdAt: order.createdAt.toISOString(),
    statusUpdatedAt: order.statusUpdatedAt.toISOString(),
    items: order.items,
  }));
}
