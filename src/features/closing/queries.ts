import { prisma } from "@/lib/db/prisma";
import { nextDate, vietnamDate } from "@/features/finance/period";
import type { DailyCloseData, DailyClosureRow, DailySummary } from "./types";

function safeDate(raw?: string) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return vietnamDate();
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === raw ? raw : vietnamDate();
}

function mapClosure(row: {
  id: string; businessDate: Date; openingCash: number; cashSales: number; cashExpenses: number; expectedCash: number;
  countedCash: number; cashDifference: number; bankTransferTotal: number; paidTotal: number; voidedTotal: number;
  unpaidTotal: number; paymentCount: number; voidedPaymentCount: number; unpaidOrderCount: number; note: string | null;
  closedAt: Date; createdBy: { displayName: string };
}): DailyClosureRow {
  return { id: row.id, businessDate: row.businessDate.toISOString().slice(0, 10), openingCash: row.openingCash,
    cashSales: row.cashSales, cashExpenses: row.cashExpenses, expectedCash: row.expectedCash, countedCash: row.countedCash,
    cashDifference: row.cashDifference, bankTransferTotal: row.bankTransferTotal, paidTotal: row.paidTotal,
    voidedTotal: row.voidedTotal, unpaidTotal: row.unpaidTotal, paymentCount: row.paymentCount,
    voidedPaymentCount: row.voidedPaymentCount, unpaidOrderCount: row.unpaidOrderCount, note: row.note,
    closedAt: row.closedAt.toISOString(), createdBy: row.createdBy.displayName };
}

export async function calculateDailySummary(rawDate?: string): Promise<DailySummary> {
  const businessDate = safeDate(rawDate);
  const from = new Date(`${businessDate}T00:00:00+07:00`);
  const to = new Date(`${nextDate(businessDate)}T00:00:00+07:00`);
  const expenseDate = new Date(`${businessDate}T00:00:00.000Z`);
  const [payments, expenses, orders] = await Promise.all([
    prisma.payment.findMany({ where: { branch: { code: "MAIN" }, receivedAt: { gte: from, lt: to } }, select: { status: true, method: true, amount: true } }),
    prisma.expense.findMany({ where: { branch: { code: "MAIN" }, incurredAt: expenseDate, paymentMethod: "CASH" }, select: { amount: true } }),
    prisma.order.findMany({ where: { branch: { code: "MAIN" }, createdAt: { gte: from, lt: to }, status: { not: "CANCELLED" } }, select: { totalAmount: true, payment: { select: { status: true } } } }),
  ]);
  const paid = payments.filter((payment) => payment.status === "PAID");
  const voided = payments.filter((payment) => payment.status === "VOIDED");
  const unpaid = orders.filter((order) => order.payment?.status !== "PAID");
  return {
    businessDate,
    cashSales: paid.filter((payment) => payment.method === "CASH").reduce((sum, payment) => sum + payment.amount, 0),
    bankTransferTotal: paid.filter((payment) => payment.method === "BANK_TRANSFER").reduce((sum, payment) => sum + payment.amount, 0),
    paidTotal: paid.reduce((sum, payment) => sum + payment.amount, 0),
    cashExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    voidedTotal: voided.reduce((sum, payment) => sum + payment.amount, 0),
    unpaidTotal: unpaid.reduce((sum, order) => sum + order.totalAmount, 0),
    paymentCount: paid.length, voidedPaymentCount: voided.length, unpaidOrderCount: unpaid.length,
  };
}

export async function listDailyClosures(take = 100): Promise<DailyClosureRow[]> {
  const rows = await prisma.dailyClosure.findMany({ where: { branch: { code: "MAIN" } }, include: { createdBy: { select: { displayName: true } } }, orderBy: { businessDate: "desc" }, take });
  return rows.map(mapClosure);
}

export async function getDailyCloseData(rawDate?: string): Promise<DailyCloseData> {
  const summary = await calculateDailySummary(rawDate);
  const [existingRow, history] = await Promise.all([
    prisma.dailyClosure.findFirst({ where: { branch: { code: "MAIN" }, businessDate: new Date(`${summary.businessDate}T00:00:00.000Z`) }, include: { createdBy: { select: { displayName: true } } } }),
    listDailyClosures(),
  ]);
  return { summary, existing: existingRow ? mapClosure(existingRow) : null, history };
}
