import { prisma } from "@/lib/db/prisma";
import type { OrderReceipt } from "../types";

export async function getOrderReceipt(
  rawTableCode: string,
  orderId: string,
): Promise<OrderReceipt | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const tableCode = rawTableCode.trim().toUpperCase();
  if (!/^T\d{2}$/.test(tableCode)) return null;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      source: "CUSTOMER_QR",
      table: { code: tableCode },
    },
    include: {
      table: { select: { code: true, name: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return null;

  return {
    id: order.id,
    orderNo: order.orderNo,
    tableCode: order.table.code,
    tableName: order.table.name,
    status: order.status,
    totalAmount: order.totalAmount,
    customerNote: order.customerNote,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      itemNote: item.itemNote,
    })),
  };
}
