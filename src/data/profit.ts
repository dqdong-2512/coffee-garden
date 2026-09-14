import type { ProfitSummary, RevenuePoint, SalesCategory } from "@/types";
export const profitSummary: ProfitSummary = {
  revenue: 181200000,
  cogs: 65232000,
  operating: 38000000,
};
export const profitTrend: RevenuePoint[] = [
  { name: "Apr", revenue: 142000000, profit: 51000000 },
  { name: "May", revenue: 156000000, profit: 58000000 },
  { name: "Jun", revenue: 148000000, profit: 54000000 },
  { name: "Jul", revenue: 168000000, profit: 69000000 },
  { name: "Aug", revenue: 174000000, profit: 73000000 },
  { name: "Sep", revenue: 181200000, profit: 77968000 },
];
export const categoryProfit: SalesCategory[] = [
  { name: "Coffee", value: 52000000, color: "#6B4F3A" },
  { name: "Breakfast", value: 34000000, color: "#708C5A" },
  { name: "Juice", value: 15000000, color: "#D6A84B" },
  { name: "Tea", value: 9000000, color: "#A8B99A" },
  { name: "Other", value: 5968000, color: "#D8CFC5" },
];
