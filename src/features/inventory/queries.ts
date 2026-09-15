import { prisma } from "@/lib/db/prisma";
import type { IngredientRow, RecipeProduct, StockMovementRow } from "./types";

export const unitLabels = { GRAM: "g", MILLILITER: "ml", PIECE: "cái" } as const;
const movementLabels: Record<string, string> = { STOCK_IN: "Nhập kho", ADJUSTMENT: "Điều chỉnh", CONSUMPTION: "Xuất theo order" };

export async function listIngredients(): Promise<IngredientRow[]> {
  const rows = await prisma.ingredient.findMany({ where: { branch: { code: "MAIN" } }, include: { _count: { select: { recipeItems: true } } }, orderBy: { name: "asc" } });
  return rows.map((row) => ({
    id: row.id, name: row.name, slug: row.slug, unit: row.unit, unitLabel: unitLabels[row.unit], currentQuantity: row.currentQuantity,
    lowStockThreshold: row.lowStockThreshold, costPerUnit: row.costPerUnit, stockValue: row.currentQuantity * row.costPerUnit,
    isLow: row.currentQuantity <= row.lowStockThreshold, isActive: row.isActive, recipeCount: row._count.recipeItems,
  }));
}

export async function listRecipes(): Promise<RecipeProduct[]> {
  const products = await prisma.product.findMany({ where: { branch: { code: "MAIN" } }, include: { recipeItems: { include: { ingredient: true }, orderBy: { ingredient: { name: "asc" } } } }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  return products.map((product) => ({
    id: product.id, name: product.name, price: product.price,
    costAmount: product.recipeItems.reduce((sum, item) => sum + item.quantity * item.ingredient.costPerUnit, 0),
    lines: product.recipeItems.map((item) => ({ ingredientId: item.ingredientId, ingredientName: item.ingredient.name, unitLabel: unitLabels[item.ingredient.unit], quantity: item.quantity, cost: item.quantity * item.ingredient.costPerUnit })),
  }));
}

export async function listStockMovements(): Promise<StockMovementRow[]> {
  const rows = await prisma.stockMovement.findMany({ where: { branch: { code: "MAIN" } }, include: { ingredient: true, createdBy: { select: { displayName: true } }, order: { select: { orderNo: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  return rows.map((row) => ({
    id: row.id, ingredientName: row.ingredient.name, unitLabel: unitLabels[row.ingredient.unit], type: movementLabels[row.type] ?? row.type,
    typeCode: row.type, quantity: row.quantity, balanceAfter: row.balanceAfter, unitCost: row.unitCost, totalCost: row.totalCost,
    note: row.note, createdBy: row.createdBy?.displayName ?? "Hệ thống", orderNo: row.order?.orderNo ?? null, createdAt: row.createdAt.toISOString(),
  }));
}
