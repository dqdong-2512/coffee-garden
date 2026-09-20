import { prisma } from "@/lib/db/prisma";
import type { PaymentOrder, PosCatalog, StaffTableDirectory } from "./types";

export async function getStaffTableDirectory(): Promise<StaffTableDirectory | null> {
  const branch = await prisma.branch.findUnique({
    where: { code: "MAIN", isActive: true },
    select: {
      id: true,
      name: true,
      diningTables: {
        where: { isActive: true },
        orderBy: { code: "asc" },
        select: { id: true, code: true, name: true },
      },
    },
  });
  if (!branch) return null;
  return {
    branch: { id: branch.id, name: branch.name },
    tables: branch.diningTables,
  };
}

export async function getPosCatalog(): Promise<PosCatalog | null> {
  const branch = await prisma.branch.findUnique({
    where: { code: "MAIN", isActive: true },
    select: {
      id: true,
      name: true,
      categories: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      },
      products: {
        where: { isAvailable: true, category: { isActive: true } },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          categoryId: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          imageUrl: true,
        },
      },
      diningTables: {
        where: { isActive: true },
        orderBy: { code: "asc" },
        select: { id: true, code: true, name: true },
      },
    },
  });
  if (!branch) return null;
  return {
    branch: { id: branch.id, name: branch.name },
    categories: branch.categories,
    products: branch.products,
    tables: branch.diningTables,
  };
}

export async function listPaymentOrders(take = 100): Promise<PaymentOrder[]> {
  const rows = await prisma.order.findMany({
    where: { branch: { code: "MAIN" } },
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      source: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      table: { select: { name: true } },
      payment: {
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          reference: true,
          note: true,
          receivedAt: true,
          voidReason: true,
          createdBy: { select: { displayName: true } },
        },
      },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    orderNo: row.orderNo,
    tableName: row.table.name,
    source: row.source,
    status: row.status,
    totalAmount: row.totalAmount,
    createdAt: row.createdAt.toISOString(),
    payment: row.payment
      ? {
          id: row.payment.id,
          method: row.payment.method,
          status: row.payment.status,
          amount: row.payment.amount,
          reference: row.payment.reference,
          note: row.payment.note,
          receivedAt: row.payment.receivedAt.toISOString(),
          voidReason: row.payment.voidReason,
          createdByName: row.payment.createdBy.displayName,
        }
      : null,
  }));
}
