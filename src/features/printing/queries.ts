import { prisma } from "@/lib/db/prisma";
import type { PrintableOrder } from "./types";

export async function getPrintableOrder(orderId: string): Promise<PrintableOrder | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) return null;
  const order = await prisma.order.findFirst({
    where: { id: orderId, branch: { code: "MAIN" } },
    select: {
      id: true,
      orderNo: true,
      source: true,
      status: true,
      customerNote: true,
      totalAmount: true,
      createdAt: true,
      branch: { select: { name: true, address: true, phone: true, taxCode: true, receiptFooter: true } },
      table: { select: { code: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: { id: true, productName: true, unitPrice: true, quantity: true, lineTotal: true, itemNote: true },
      },
      payment: {
        select: {
          method: true,
          status: true,
          amount: true,
          reference: true,
          receivedAt: true,
          createdBy: { select: { displayName: true } },
        },
      },
    },
  });
  if (!order) return null;
  return {
    id: order.id,
    orderNo: order.orderNo,
    source: order.source,
    status: order.status,
    tableCode: order.table.code,
    tableName: order.table.name,
    customerNote: order.customerNote,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    shop: order.branch,
    items: order.items,
    payment: order.payment ? {
      method: order.payment.method,
      status: order.payment.status,
      amount: order.payment.amount,
      reference: order.payment.reference,
      receivedAt: order.payment.receivedAt.toISOString(),
      createdByName: order.payment.createdBy.displayName,
    } : null,
  };
}
