export type IngredientRow = {
  id: string; name: string; slug: string; unit: "GRAM" | "MILLILITER" | "PIECE"; unitLabel: string;
  currentQuantity: number; lowStockThreshold: number; costPerUnit: number; stockValue: number;
  isLow: boolean; isActive: boolean; recipeCount: number;
};

export type RecipeLine = { ingredientId: string; ingredientName: string; unitLabel: string; quantity: number; cost: number };
export type RecipeProduct = { id: string; name: string; price: number; costAmount: number; lines: RecipeLine[] };
export type StockMovementRow = {
  id: string; ingredientName: string; unitLabel: string; type: string; typeCode: string;
  quantity: number; balanceAfter: number; unitCost: number; totalCost: number; note: string;
  createdBy: string; orderNo: string | null; createdAt: string;
};
