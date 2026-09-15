CREATE TYPE "ExpenseCategory" AS ENUM ('INGREDIENT', 'SALARY', 'ELECTRICITY', 'WATER', 'RENT', 'MARKETING', 'EQUIPMENT', 'OTHER');

CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" INTEGER NOT NULL,
    "incurredAt" DATE NOT NULL,
    "supplier" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Expense_externalRef_key" ON "Expense"("externalRef");
CREATE INDEX "Expense_branchId_incurredAt_idx" ON "Expense"("branchId", "incurredAt");
CREATE INDEX "Expense_branchId_category_incurredAt_idx" ON "Expense"("branchId", "category", "incurredAt");
CREATE INDEX "Expense_createdById_createdAt_idx" ON "Expense"("createdById", "createdAt");
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
