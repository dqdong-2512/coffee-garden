import { prisma } from "@/lib/db/prisma";
import type { ManagedCategory, ManagedProduct, ManagedTable } from "./types";

export async function listManagedCategories(): Promise<ManagedCategory[]> {
  const rows = await prisma.category.findMany({
    where: { branch: { code: "MAIN" } },
    include: { _count: { select: { products: true } } },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    productCount: row._count.products,
  }));
}

export async function listManagedProducts(): Promise<ManagedProduct[]> {
  const rows = await prisma.product.findMany({
    where: { branch: { code: "MAIN" } },
    include: { category: { select: { name: true } } },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    isAvailable: row.isAvailable,
    displayOrder: row.displayOrder,
  }));
}

export async function listManagedTables(): Promise<ManagedTable[]> {
  const rows = await prisma.diningTable.findMany({
    where: { branch: { code: "MAIN" } },
    include: { _count: { select: { orders: true } } },
    orderBy: { code: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.isActive,
    orderCount: row._count.orders,
  }));
}
