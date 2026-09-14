export interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  note?: string;
  tone?: "green" | "brown" | "gold";
}
export interface RevenuePoint {
  name: string;
  revenue: number;
  previous?: number;
  profit?: number;
}
export interface ProductPerformance {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  cost: number;
}
export interface SalesCategory {
  name: string;
  value: number;
  color: string;
}
export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  supplier: string;
  amount: number;
  payment: string;
  createdBy: string;
}
export interface ProfitSummary {
  revenue: number;
  cogs: number;
  operating: number;
}
