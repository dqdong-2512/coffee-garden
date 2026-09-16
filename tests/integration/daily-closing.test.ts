import assert from "node:assert/strict";
import test from "node:test";
import { closeDay, ClosingError } from "../../src/features/closing/closing-service";
import { createExpense } from "../../src/features/finance/expense-service";
import { prisma } from "../../src/lib/db/prisma";

test("persists an immutable daily close with server-calculated cash expenses", async (context) => {
  const owner = await prisma.staffUser.findUniqueOrThrow({ where: { username: "owner" } });
  const businessDate = "2026-08-29";
  await prisma.dailyClosure.deleteMany({ where: { businessDate: new Date(`${businessDate}T00:00:00.000Z`) } });
  const expense = await createExpense({ category: "OTHER", amount: 10000, incurredAt: businessDate, supplier: "Closing Test", description: "Cash expense test", paymentMethod: "CASH" }, owner.id);
  context.after(async () => {
    await prisma.dailyClosure.deleteMany({ where: { businessDate: new Date(`${businessDate}T00:00:00.000Z`) } });
    await prisma.expense.delete({ where: { id: expense.id } });
    await prisma.$disconnect();
  });

  const closure = await closeDay({ businessDate, openingCash: 50000, countedCash: 40000, note: "Integration close" }, owner.id);
  assert.equal(closure.cashExpenses, 10000);
  assert.equal(closure.expectedCash, 40000);
  assert.equal(closure.cashDifference, 0);
  await assert.rejects(
    () => closeDay({ businessDate, openingCash: 50000, countedCash: 40000 }, owner.id),
    (error) => error instanceof ClosingError && error.code === "ALREADY_CLOSED",
  );
});
