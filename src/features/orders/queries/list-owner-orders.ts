import { prisma } from "@/lib/db/prisma";

export async function listOwnerOrders() {
  return prisma.order.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      createdAt: true,
      totalAmount: true,
      source: true,
      status: true,
      customerNote: true,
      cancellationReason: true,
      table: { select: { code: true } },
      _count: { select: { items: true } },
      items: {
        select: {
          productName: true,
          quantity: true,
          itemNote: true,
          lineTotal: true,
        },
      },
    },
  });
}
