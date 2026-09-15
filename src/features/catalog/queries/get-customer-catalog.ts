import { prisma } from "@/lib/db/prisma";
import type { CustomerCatalog } from "../types";

export async function getCustomerCatalog(
  rawTableCode: string,
): Promise<CustomerCatalog | null> {
  const tableCode = rawTableCode.trim().toUpperCase();
  if (!/^T\d{2}$/.test(tableCode)) return null;

  const table = await prisma.diningTable.findFirst({
    where: {
      code: tableCode,
      isActive: true,
      branch: { isActive: true },
    },
    select: {
      id: true,
      code: true,
      name: true,
      branch: {
        select: {
          id: true,
          name: true,
          categories: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            select: { id: true, name: true, slug: true },
          },
          products: {
            where: {
              isAvailable: true,
              category: { isActive: true },
            },
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
        },
      },
    },
  });

  if (!table) return null;
  return {
    branch: { id: table.branch.id, name: table.branch.name },
    table: { id: table.id, code: table.code, name: table.name },
    categories: table.branch.categories,
    products: table.branch.products,
  };
}
