import { prisma } from "@/lib/db/prisma";
import { dateRange, financePeriod, nextDate } from "./period";
import type { ExpenseRow, FinanceReport } from "./types";

const colors = ["#6B4F3A", "#708C5A", "#D6A84B", "#A8B99A", "#D8CFC5"];
export const expenseLabels: Record<string, string> = {
  INGREDIENT: "Nguyên liệu", SALARY: "Lương", ELECTRICITY: "Điện", WATER: "Nước",
  RENT: "Mặt bằng", MARKETING: "Marketing", EQUIPMENT: "Thiết bị", OTHER: "Khác",
};
export const methodLabels: Record<string, string> = { CASH: "Tiền mặt", BANK_TRANSFER: "Chuyển khoản" };

function expenseRow(row: Awaited<ReturnType<typeof prisma.expense.findFirstOrThrow>> & { createdBy: { displayName: string } }): ExpenseRow {
  return {
    id: row.id, date: row.incurredAt.toISOString().slice(0, 10),
    category: expenseLabels[row.category] ?? row.category, categoryCode: row.category,
    description: row.description, supplier: row.supplier, amount: row.amount,
    payment: methodLabels[row.paymentMethod] ?? row.paymentMethod,
    paymentCode: row.paymentMethod, createdBy: row.createdBy.displayName,
  };
}

export async function getFinanceReport(rawFrom?: string, rawTo?: string): Promise<FinanceReport> {
  const period = financePeriod(rawFrom, rawTo);
  const paymentFrom = new Date(`${period.from}T00:00:00+07:00`);
  const paymentTo = new Date(`${nextDate(period.to)}T00:00:00+07:00`);
  const expenseFrom = new Date(`${period.from}T00:00:00.000Z`);
  const expenseTo = new Date(`${period.to}T00:00:00.000Z`);
  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { branch: { code: "MAIN" }, status: "PAID", receivedAt: { gte: paymentFrom, lt: paymentTo } },
      include: { order: { include: { items: { include: { product: { include: { category: true } } } } } } },
      orderBy: { receivedAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { branch: { code: "MAIN" }, incurredAt: { gte: expenseFrom, lte: expenseTo } },
    }),
  ]);
  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const ingredientExpenses = expenses.filter((expense) => expense.category === "INGREDIENT").reduce((sum, expense) => sum + expense.amount, 0);
  const byDate = new Map<string, number>();
  const expensesByDate = new Map<string, number>();
  const byHour = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byMethod = new Map<string, number>();
  const byProduct = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();
  for (const payment of payments) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(payment.receivedAt);
    const hour = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(payment.receivedAt);
    byDate.set(date, (byDate.get(date) ?? 0) + payment.amount);
    byHour.set(hour, (byHour.get(hour) ?? 0) + payment.amount);
    byMethod.set(methodLabels[payment.method], (byMethod.get(methodLabels[payment.method]) ?? 0) + payment.amount);
    for (const item of payment.order.items) {
      const category = item.product.category.name;
      byCategory.set(category, (byCategory.get(category) ?? 0) + item.lineTotal);
      const product = byProduct.get(item.productId) ?? { name: item.productName, category, quantity: 0, revenue: 0 };
      product.quantity += item.quantity; product.revenue += item.lineTotal; byProduct.set(item.productId, product);
    }
  }
  const expensesByCategory = new Map<string, number>();
  for (const expense of expenses) {
    const date = expense.incurredAt.toISOString().slice(0, 10);
    expensesByDate.set(date, (expensesByDate.get(date) ?? 0) + expense.amount);
    const label = expenseLabels[expense.category] ?? expense.category;
    expensesByCategory.set(label, (expensesByCategory.get(label) ?? 0) + expense.amount);
  }
  const shares = (map: Map<string, number>) => [...map.entries()].map(([name, value], index) => ({
    name, value: revenue ? Math.round((value / revenue) * 1000) / 10 : 0, color: colors[index % colors.length]!,
  }));
  return {
    period, revenue, paymentCount: payments.length,
    averageOrderValue: payments.length ? Math.round(revenue / payments.length) : 0,
    expenses: expenseTotal, ingredientExpenses,
    operatingExpenses: expenseTotal - ingredientExpenses,
    estimatedProfit: revenue - expenseTotal,
    revenueSeries: dateRange(period.from, period.to).map((date) => ({ name: date.slice(5).split("-").reverse().join("/"), revenue: byDate.get(date) ?? 0 })),
    profitSeries: dateRange(period.from, period.to).map((date) => ({
      name: date.slice(5).split("-").reverse().join("/"),
      revenue: byDate.get(date) ?? 0,
      profit: (byDate.get(date) ?? 0) - (expensesByDate.get(date) ?? 0),
    })),
    hourlyRevenue: Array.from({ length: 18 }, (_, index) => { const hour = String(index + 5).padStart(2, "0"); return { name: `${hour}:00`, revenue: byHour.get(hour) ?? 0 }; }),
    revenueByCategory: shares(byCategory), revenueByMethod: shares(byMethod),
    expensesByCategory: [...expensesByCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length]! })),
    products: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue),
  };
}

export async function listExpenses(): Promise<ExpenseRow[]> {
  const rows = await prisma.expense.findMany({
    where: { branch: { code: "MAIN" } }, include: { createdBy: { select: { displayName: true } } },
    orderBy: [{ incurredAt: "desc" }, { createdAt: "desc" }], take: 200,
  });
  return rows.map(expenseRow);
}

export { expenseRow };
