import { prisma } from "@/lib/db/prisma";
import { expenseRow } from "./queries";
import { createExpenseSchema } from "./validation";

export async function createExpense(raw: unknown, createdById: string) {
  const input = createExpenseSchema.parse(raw);
  const branch = await prisma.branch.findUnique({ where: { code: "MAIN" }, select: { id: true } });
  if (!branch) throw new Error("MAIN_BRANCH_NOT_FOUND");
  const saved = await prisma.expense.create({
    data: {
      branchId: branch.id,
      createdById,
      category: input.category,
      amount: input.amount,
      incurredAt: new Date(`${input.incurredAt}T00:00:00.000Z`),
      supplier: input.supplier,
      description: input.description,
      paymentMethod: input.paymentMethod,
    },
    include: { createdBy: { select: { displayName: true } } },
  });
  return expenseRow(saved);
}
