CREATE TYPE "IngredientUnit" AS ENUM ('GRAM', 'MILLILITER', 'PIECE');
CREATE TYPE "StockMovementType" AS ENUM ('STOCK_IN', 'ADJUSTMENT', 'CONSUMPTION');

ALTER TABLE "Order" ADD COLUMN "costAmount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Ingredient" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "unit" "IngredientUnit" NOT NULL,
  "currentQuantity" INTEGER NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 0,
  "costPerUnit" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecipeItem" (
  "id" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "ingredientId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "RecipeItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockMovement" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "ingredientId" UUID NOT NULL,
  "createdById" UUID,
  "orderId" UUID,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "unitCost" INTEGER NOT NULL,
  "totalCost" INTEGER NOT NULL,
  "note" TEXT NOT NULL,
  "externalRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ingredient_branchId_slug_key" ON "Ingredient"("branchId", "slug");
CREATE INDEX "Ingredient_branchId_isActive_idx" ON "Ingredient"("branchId", "isActive");
CREATE UNIQUE INDEX "RecipeItem_productId_ingredientId_key" ON "RecipeItem"("productId", "ingredientId");
CREATE INDEX "RecipeItem_ingredientId_idx" ON "RecipeItem"("ingredientId");
CREATE UNIQUE INDEX "StockMovement_externalRef_key" ON "StockMovement"("externalRef");
CREATE UNIQUE INDEX "StockMovement_orderId_ingredientId_key" ON "StockMovement"("orderId", "ingredientId");
CREATE INDEX "StockMovement_branchId_createdAt_idx" ON "StockMovement"("branchId", "createdAt");
CREATE INDEX "StockMovement_ingredientId_createdAt_idx" ON "StockMovement"("ingredientId", "createdAt");
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecipeItem" ADD CONSTRAINT "RecipeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecipeItem" ADD CONSTRAINT "RecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
