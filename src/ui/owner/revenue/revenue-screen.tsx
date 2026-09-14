"use client";
import { useState, type FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { revenueMetrics, paymentMethods } from "@/data/revenue";
import { salesCategories } from "@/data/dashboard";
import { PageHeader, StatCards, Button } from "@/ui/core/primitives";
import { TrendChart, CategoryChart } from "@/ui/owner/charts";
import { ProductTable } from "@/ui/owner/product-table";
export function RevenueScreen() {
  const [notice, setNotice] = useState("");
  function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const from = String(data.get("from"));
    const to = String(data.get("to"));
    setNotice(
      from > to
        ? "Date From must be before Date To."
        : `Preview filters applied: ${from} to ${to}. Charts retain the labeled sample periods; live filtering is coming in a future step.`,
    );
  }
  return (
    <>
      <PageHeader
        title="Revenue Management"
        description="Understand your sales, from the first morning coffee to the last order."
      />
      <form className="filter-bar" onSubmit={apply}>
        <label>
          Branch
          <select>
            <option>Main Branch</option>
          </select>
        </label>
        <label>
          Date From
          <input name="from" type="date" defaultValue="2026-09-01" required />
        </label>
        <label>
          Date To
          <input name="to" type="date" defaultValue="2026-09-14" required />
        </label>
        <label>
          Compare Period
          <select>
            <option>Previous period</option>
            <option>Previous year</option>
            <option>No comparison</option>
          </select>
        </label>
        <Button type="submit">
          <SlidersHorizontal size={15} />
          Apply
        </Button>
      </form>
      <p className="mock-note" role="status">
        {notice ||
          "Mock preview · 1–14 September 2026 · Controls do not query live data."}
      </p>
      <StatCards metrics={revenueMetrics} />
      <TrendChart title="Revenue Trend" />
      <div className="mt-6">
        <ProductTable detailed />
      </div>
      <div className="grid-equal">
        <CategoryChart title="Revenue by Category" data={salesCategories} />
        <CategoryChart
          title="Revenue by Payment Method"
          data={paymentMethods}
        />
      </div>
    </>
  );
}
