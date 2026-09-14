import { CalendarDays, Sunrise, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  dashboardMetrics,
  salesCategories,
  hourlyRevenue,
  breakfast,
} from "@/data/dashboard";
import { Card, PageHeader, StatCards } from "@/ui/core/primitives";
import { TrendChart, CategoryChart, HourChart } from "@/ui/owner/charts";
import { ProductTable } from "@/ui/owner/product-table";
export function DashboardScreen() {
  return (
    <>
      <PageHeader
        title="A fresh look at your business"
        description="Welcome back, Minh Anh. Here’s how Coffee Garden is doing today."
        action={
          <div className="date-chip">
            <CalendarDays size={16} />
            14 September, 2026
          </div>
        }
      />
      <div className="section-eyebrow">
        <span>OVERVIEW</span>
        <span className="flex items-center gap-2">
          <span className="status-dot" /> Main Branch{" "}
          <span className="demo-label">Mock data</span>
        </span>
      </div>
      <StatCards metrics={dashboardMetrics} />
      <div className="grid-main">
        <TrendChart />
        <CategoryChart title="Sales by Category" data={salesCategories} />
      </div>
      <div className="grid-main">
        <HourChart data={hourlyRevenue} />
        <Card className="breakfast-card">
          <div className="flex items-center gap-3">
            <span className="breakfast-icon">
              <Sunrise size={23} />
            </span>
            <div>
              <h2>Breakfast Performance</h2>
              <p className="muted mt-1 text-xs">
                A good morning, a great business.
              </p>
            </div>
          </div>
          <p className="muted mt-5 text-xs">1–14 September 2026</p>
          <div className="breakfast-grid">
            {breakfast.map(([label, value]) => (
              <div key={label}>
                <p className="muted text-xs">{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <Link className="breakfast-link" href="/owner/breakfast-analytics">
            Explore breakfast insights <ArrowUpRight size={16} />
          </Link>
        </Card>
      </div>
      <ProductTable />
    </>
  );
}
