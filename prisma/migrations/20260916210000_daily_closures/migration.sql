CREATE TABLE "DailyClosure" (
  "id" UUID NOT NULL,
  "branchId" UUID NOT NULL,
  "createdById" UUID NOT NULL,
  "businessDate" DATE NOT NULL,
  "openingCash" INTEGER NOT NULL,
  "cashSales" INTEGER NOT NULL,
  "cashExpenses" INTEGER NOT NULL,
  "expectedCash" INTEGER NOT NULL,
  "countedCash" INTEGER NOT NULL,
  "cashDifference" INTEGER NOT NULL,
  "bankTransferTotal" INTEGER NOT NULL,
  "paidTotal" INTEGER NOT NULL,
  "voidedTotal" INTEGER NOT NULL,
  "unpaidTotal" INTEGER NOT NULL,
  "paymentCount" INTEGER NOT NULL,
  "voidedPaymentCount" INTEGER NOT NULL,
  "unpaidOrderCount" INTEGER NOT NULL,
  "note" TEXT,
  "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyClosure_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DailyClosure_branchId_businessDate_key" ON "DailyClosure"("branchId", "businessDate");
CREATE INDEX "DailyClosure_branchId_closedAt_idx" ON "DailyClosure"("branchId", "closedAt");
CREATE INDEX "DailyClosure_createdById_closedAt_idx" ON "DailyClosure"("createdById", "closedAt");
ALTER TABLE "DailyClosure" ADD CONSTRAINT "DailyClosure_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DailyClosure" ADD CONSTRAINT "DailyClosure_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
