import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { vietnamDate } from "@/features/finance/period";
import { calculateDailySummary } from "./queries";
import { closeDaySchema } from "./validation";

export class ClosingError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export async function closeDay(raw: unknown, createdById: string) {
  const input = closeDaySchema.parse(raw);
  if (input.businessDate > vietnamDate()) throw new ClosingError("FUTURE_DATE", "Không thể chốt một ngày trong tương lai.");
  const branch = await prisma.branch.findUnique({ where: { code: "MAIN" }, select: { id: true } });
  if (!branch) throw new ClosingError("BRANCH_NOT_FOUND", "Chưa tìm thấy cấu hình quán.", 503);
  const summary = await calculateDailySummary(input.businessDate);
  const expectedCash = input.openingCash + summary.cashSales - summary.cashExpenses;
  try {
    return await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`daily-close:${branch.id}:${input.businessDate}`}))::text`;
      const existing = await transaction.dailyClosure.findUnique({ where: { branchId_businessDate: { branchId: branch.id, businessDate: new Date(`${input.businessDate}T00:00:00.000Z`) } } });
      if (existing) throw new ClosingError("ALREADY_CLOSED", "Ngày này đã được chốt. Phiếu cũ được giữ nguyên để đối soát.", 409);
      return transaction.dailyClosure.create({ data: {
        branchId: branch.id, createdById, businessDate: new Date(`${input.businessDate}T00:00:00.000Z`),
        openingCash: input.openingCash, cashSales: summary.cashSales, cashExpenses: summary.cashExpenses,
        expectedCash, countedCash: input.countedCash, cashDifference: input.countedCash - expectedCash,
        bankTransferTotal: summary.bankTransferTotal, paidTotal: summary.paidTotal, voidedTotal: summary.voidedTotal,
        unpaidTotal: summary.unpaidTotal, paymentCount: summary.paymentCount, voidedPaymentCount: summary.voidedPaymentCount,
        unpaidOrderCount: summary.unpaidOrderCount, note: input.note || null,
      } });
    });
  } catch (error) {
    if (error instanceof ClosingError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ClosingError("ALREADY_CLOSED", "Ngày này đã được chốt.", 409);
    throw error;
  }
}
