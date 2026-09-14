import type { DashboardMetric, RevenuePoint, SalesCategory } from "@/types";
export const revenueMetrics: DashboardMetric[] = [
  {
    label: "Gross Revenue",
    value: "186.400.000 ₫",
    change: "+14.8%",
    note: "vs previous period",
  },
  {
    label: "Net Revenue",
    value: "181.200.000 ₫",
    change: "+13.2%",
    note: "After discounts & refunds",
  },
  {
    label: "Orders",
    value: "2,684",
    change: "+9.6%",
    note: "vs previous period",
  },
  {
    label: "Average Order Value",
    value: "67.511 ₫",
    change: "+3.3%",
    note: "Net revenue per order",
  },
];
export const revenueSeries: Record<"Day" | "Week" | "Month", RevenuePoint[]> = {
  Day: [
    8.1, 9.8, 8.7, 12.1, 10.8, 15.6, 13.9, 11.2, 12.7, 10.5, 14.2, 17.1, 18.85,
    12.85,
  ].map((v, i) => ({
    name: `${i + 1} Sep`,
    revenue: v * 1000000,
    previous: (v * 0.76 + (i % 3)) * 1000000,
  })),
  Week: [65.2, 72.8, 78.5, 86.4].map((v, i) => ({
    name: `Week ${i + 1}`,
    revenue: v * 1000000,
    previous: v * 820000,
  })),
  Month: [242, 258, 231, 280, 295, 312].map((v, i) => ({
    name: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i],
    revenue: v * 1000000,
    previous: v * 810000,
  })),
};
export const paymentMethods: SalesCategory[] = [
  { name: "Cash", value: 28, color: "#6B4F3A" },
  { name: "Bank Transfer", value: 32, color: "#708C5A" },
  { name: "QR Payment", value: 40, color: "#D6A84B" },
];
