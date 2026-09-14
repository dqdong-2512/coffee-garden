import type { DashboardMetric, RevenuePoint, SalesCategory } from "@/types";
export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Today Revenue",
    value: "12.850.000 ₫",
    change: "+12.5%",
    note: "vs yesterday",
    tone: "brown",
  },
  {
    label: "Orders",
    value: "184",
    change: "+8.2%",
    note: "vs yesterday",
    tone: "green",
  },
  {
    label: "Expenses",
    value: "3.200.000 ₫",
    change: "−5.1%",
    note: "vs yesterday",
    tone: "gold",
  },
  {
    label: "Estimated Profit",
    value: "9.650.000 ₫",
    change: "+17.3%",
    note: "Revenue less expenses",
    tone: "green",
  },
];
export const salesCategories: SalesCategory[] = [
  { name: "Coffee", value: 42, color: "#6B4F3A" },
  { name: "Breakfast", value: 31, color: "#708C5A" },
  { name: "Juice", value: 14, color: "#D6A84B" },
  { name: "Tea", value: 8, color: "#A8B99A" },
  { name: "Other", value: 5, color: "#D8CFC5" },
];
export const hourlyRevenue: RevenuePoint[] = [
  1.2, 3.8, 8.2, 12.4, 9.8, 5.1, 2.8,
].map((v, i) => ({
  name: `${String(i + 5).padStart(2, "0")}:00`,
  revenue: v * 1000000,
}));
export const breakfast = [
  ["Revenue", "48.200.000 ₫"],
  ["Orders", "742"],
  ["Average bill", "64.960 ₫"],
  ["Peak time", "07:15 – 08:45"],
  ["Best seller", "Bò kho"],
  ["Coffee attach rate", "63%"],
];
