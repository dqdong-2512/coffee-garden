import { prisma } from "@/lib/db/prisma";
import { createIngredientSchema, replaceRecipeSchema, stockMovementSchema, updateIngredientSchema } from "./validation";

export class InventoryError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ingredient";
}

async function mainBranch() {
  const branch = await prisma.branch.findUnique({ where: { code: "MAIN" }, select: { id: true } });
  if (!branch) throw new InventoryError("BRANCH_NOT_FOUND", "Chưa tìm thấy cấu hình quán.", 503);
  return branch;
}

export async function createIngredient(raw: unknown) {
  const input = createIngredientSchema.parse(raw); const branch = await mainBranch(); const base = slugify(input.name);
  let slug = base;
  for (let suffix = 2; await prisma.ingredient.findUnique({ where: { branchId_slug: { branchId: branch.id, slug } } }); suffix += 1) slug = `${base}-${suffix}`;
  return prisma.ingredient.create({ data: { ...input, branchId: branch.id, slug } });
}

export async function updateIngredient(id: string, raw: unknown) {
  const input = updateIngredientSchema.parse(raw); const branch = await mainBranch();
  const current = await prisma.ingredient.findFirst({ where: { id, branchId: branch.id } });
  if (!current) throw new InventoryError("INGREDIENT_NOT_FOUND", "Không tìm thấy nguyên liệu.", 404);
  return prisma.ingredient.update({ where: { id }, data: input });
}

export async function recordStockMovement(raw: unknown, createdById: string) {
  const input = stockMovementSchema.parse(raw); const branch = await mainBranch();
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${input.ingredientId}))::text`;
    const ingredient = await transaction.ingredient.findFirst({ where: { id: input.ingredientId, branchId: branch.id } });
    if (!ingredient) throw new InventoryError("INGREDIENT_NOT_FOUND", "Không tìm thấy nguyên liệu.", 404);
    const delta = input.type === "STOCK_IN" ? input.quantity : input.actualQuantity - ingredient.currentQuantity;
    if (!delta) throw new InventoryError("NO_STOCK_CHANGE", "Số lượng kiểm kê không thay đổi.");
    const balanceAfter = ingredient.currentQuantity + delta;
    const costPerUnit = input.type === "STOCK_IN"
      ? Math.round(((Math.max(ingredient.currentQuantity, 0) * ingredient.costPerUnit) + input.quantity * input.unitCost) / (Math.max(ingredient.currentQuantity, 0) + input.quantity))
      : ingredient.costPerUnit;
    await transaction.ingredient.update({ where: { id: ingredient.id }, data: { currentQuantity: balanceAfter, costPerUnit } });
    return transaction.stockMovement.create({ data: {
      branchId: branch.id, ingredientId: ingredient.id, createdById, type: input.type, quantity: delta, balanceAfter,
      unitCost: input.type === "STOCK_IN" ? input.unitCost : ingredient.costPerUnit,
      totalCost: input.type === "STOCK_IN" ? input.quantity * input.unitCost : 0, note: input.note,
    } });
  });
}

export async function replaceRecipe(productId: string, raw: unknown) {
  const input = replaceRecipeSchema.parse(raw); const branch = await mainBranch();
  const product = await prisma.product.findFirst({ where: { id: productId, branchId: branch.id } });
  if (!product) throw new InventoryError("PRODUCT_NOT_FOUND", "Không tìm thấy món.", 404);
  const ingredientCount = await prisma.ingredient.count({ where: { id: { in: input.items.map((item) => item.ingredientId) }, branchId: branch.id, isActive: true } });
  if (ingredientCount !== input.items.length) throw new InventoryError("INGREDIENT_INVALID", "Công thức chứa nguyên liệu không hợp lệ.");
  await prisma.$transaction(async (transaction) => {
    await transaction.recipeItem.deleteMany({ where: { productId } });
    if (input.items.length) await transaction.recipeItem.createMany({ data: input.items.map((item) => ({ productId, ...item })) });
  });
  return { productId };
}
