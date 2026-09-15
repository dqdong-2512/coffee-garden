import { SlidersHorizontal } from "lucide-react";
import type { FinanceReport } from "@/features/finance/types";
import { currency } from "@/lib/utils";
import { PageHeader, StatCards, Button } from "@/ui/core/primitives";
import { TrendChart, CategoryChart } from "@/ui/owner/charts";
import { RevenueProductTable } from "@/ui/owner/finance/revenue-product-table";

export function RevenueScreen({ report }: { report: FinanceReport }) {
  return <>
    <PageHeader title="Doanh thu" description="Theo dõi tiền đã thu từ các hóa đơn hoàn tất tại quán." />
    <form className="filter-bar" method="get">
      <label>Chi nhánh<select disabled><option>Chi nhánh chính</option></select></label>
      <label>Từ ngày<input name="from" type="date" defaultValue={report.period.from} required /></label>
      <label>Đến ngày<input name="to" type="date" defaultValue={report.period.to} required /></label>
      <Button type="submit"><SlidersHorizontal size={15} />Áp dụng</Button>
    </form>
    <p className="mock-note">Dữ liệu PostgreSQL · {report.period.label} · Chỉ tính thanh toán trạng thái PAID.</p>
    <StatCards metrics={[
      { label: "Doanh thu đã thu", value: currency(report.revenue), note: report.period.label, tone: "green" },
      { label: "Hóa đơn", value: report.paymentCount.toLocaleString("vi-VN"), note: "Đã thanh toán", tone: "brown" },
      { label: "Trung bình hóa đơn", value: currency(report.averageOrderValue), note: "Doanh thu ÷ hóa đơn", tone: "gold" },
      { label: "Tiền còn lại ước tính", value: currency(report.estimatedProfit), note: "Doanh thu − chi phí đã ghi", tone: "green" },
    ]} />
    <TrendChart title="Xu hướng doanh thu" data={report.revenueSeries} subtitle={`${report.period.label} · VND`} />
    <div className="mt-6"><RevenueProductTable products={report.products} subtitle={`${report.period.label} · theo hóa đơn đã thanh toán`} /></div>
    <div className="grid-equal">
      <CategoryChart title="Doanh thu theo danh mục" data={report.revenueByCategory} subtitle={`Tỷ trọng doanh thu · ${report.period.label}`} />
      <CategoryChart title="Doanh thu theo phương thức" data={report.revenueByMethod} subtitle={`Tỷ trọng doanh thu · ${report.period.label}`} />
    </div>
  </>;
}
