import { z } from "zod";

const name = z.string().trim().min(2, "Tên nguyên liệu phải có ít nhất 2 ký tự.").max(100);
const quantity = z.coerce.number().int("Số lượng phải là số nguyên.").min(0).max(1_000_000_000);

export const createIngredientSchema = z.object({
  name, unit: z.enum(["GRAM", "MILLILITER", "PIECE"]),
  lowStockThreshold: quantity.default(0), costPerUnit: quantity.default(0), isActive: z.boolean().default(true),
});

export const updateIngredientSchema = z.object({
  name: name.optional(), lowStockThreshold: quantity.optional(), costPerUnit: quantity.optional(), isActive: z.boolean().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), "Không có thay đổi để lưu.");

export const stockMovementSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("STOCK_IN"), ingredientId: z.uuid(), quantity: quantity.min(1), unitCost: quantity.min(1), note: z.string().trim().min(2).max(200) }),
  z.object({ type: z.literal("ADJUSTMENT"), ingredientId: z.uuid(), actualQuantity: quantity, note: z.string().trim().min(2).max(200) }),
]);

export const replaceRecipeSchema = z.object({
  items: z.array(z.object({ ingredientId: z.uuid(), quantity: quantity.min(1) })).max(50),
}).refine((value) => new Set(value.items.map((item) => item.ingredientId)).size === value.items.length, "Nguyên liệu trong công thức bị trùng.");
