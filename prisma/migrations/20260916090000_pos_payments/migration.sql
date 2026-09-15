ALTER TYPE "StaffRole" ADD VALUE 'CASHIER';

CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER');
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'VOIDED');

CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "amount" INTEGER NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedAt" TIMESTAMP(3),
    "voidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE INDEX "Payment_branchId_receivedAt_idx" ON "Payment"("branchId", "receivedAt");
CREATE INDEX "Payment_branchId_method_status_idx" ON "Payment"("branchId", "method", "status");
CREATE INDEX "Payment_createdById_receivedAt_idx" ON "Payment"("createdById", "receivedAt");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
