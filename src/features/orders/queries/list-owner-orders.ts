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
      table: { select: { code: true } },
      _count: { select: { items: true } },
      items: { select: { quantity: true } },
    },
  });
}
