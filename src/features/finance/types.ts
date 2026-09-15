import type { RevenuePoint, SalesCategory } from "@/types";

export type FinancialPeriod = { from: string; to: string; label: string };

export type ProductRevenue = {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
};

export type FinanceReport = {
  period: FinancialPeriod;
  revenue: number;
  paymentCount: number;
  averageOrderValue: number;
  expenses: number;
  cogs: number;
  grossProfit: number;
  ingredientExpenses: number;
  operatingExpenses: number;
  estimatedProfit: number;
  cashFlow: number;
  revenueSeries: RevenuePoint[];
  profitSeries: RevenuePoint[];
  hourlyRevenue: RevenuePoint[];
  revenueByCategory: SalesCategory[];
  revenueByMethod: SalesCategory[];
  expensesByCategory: SalesCategory[];
  products: ProductRevenue[];
};

export type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  categoryCode: string;
  description: string;
  supplier: string;
  amount: number;
  payment: string;
  paymentCode: string;
  createdBy: string;
};
