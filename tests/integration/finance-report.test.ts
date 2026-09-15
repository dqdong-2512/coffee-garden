import assert from "node:assert/strict";
import test from "node:test";
import { createExpense } from "../../src/features/finance/expense-service";
import { getFinanceReport } from "../../src/features/finance/queries";
import { vietnamDate } from "../../src/features/finance/period";
import { prisma } from "../../src/lib/db/prisma";

test("persists an expense and includes it in the cash-flow report", async (context) => {
  const owner = await prisma.staffUser.findUniqueOrThrow({ where: { username: "owner" } });
  const date = vietnamDate();
  const before = await getFinanceReport(date, date);
  const saved = await createExpense({
    category: "OTHER", amount: 12345, incurredAt: date, supplier: "Integration Test",
    description: "Temporary finance report check", paymentMethod: "CASH",
  }, owner.id);
  context.after(async () => {
    await prisma.expense.delete({ where: { id: saved.id } });
    await prisma.$disconnect();
  });
  const after = await getFinanceReport(date, date);
  assert.equal(after.expenses, before.expenses + 12345);
  assert.equal(after.estimatedProfit, before.estimatedProfit - 12345);
  assert.equal(after.expensesByCategory.some((item) => item.name === "Khác"), true);
});
