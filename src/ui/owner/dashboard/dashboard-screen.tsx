import { CalendarDays, CircleDollarSign, ReceiptText, WalletCards } from "lucide-react";
import type { FinanceReport } from "@/features/finance/types";
import { currency } from "@/lib/utils";
import { Card, PageHeader, StatCards } from "@/ui/core/primitives";
import { TrendChart, CategoryChart, HourChart } from "@/ui/owner/charts";
import { RevenueProductTable } from "@/ui/owner/finance/revenue-product-table";

export function DashboardScreen({ today, month, userName }: { today: FinanceReport; month: FinanceReport; userName: string }) {
  const method = (name: string) => month.revenueByMethod.find((item) => item.name === name)?.value ?? 0;
  return <>
    <PageHeader title="Tổng quan hoạt động" description={`Xin chào ${userName}. Đây là tình hình Coffee Garden hôm nay.`} action={<div className="date-chip"><CalendarDays size={16} />{today.period.label.split(" – ")[0]}</div>} />
    <div className="section-eyebrow"><span>TỔNG QUAN HÔM NAY</span><span className="flex items-center gap-2"><span className="status-dot" /> Chi nhánh chính</span></div>
    <StatCards metrics={[
      { label: "Doanh thu hôm nay", value: currency(today.revenue), note: "Đã thanh toán", tone: "green" },
      { label: "Hóa đơn hôm nay", value: today.paymentCount.toLocaleString("vi-VN"), note: "Trạng thái PAID", tone: "brown" },
      { label: "Trung bình hóa đơn", value: currency(today.averageOrderValue), note: "Trong ngày", tone: "gold" },
      { label: "Chi phí hôm nay", value: currency(today.expenses), note: "Đã ghi nhận", tone: "brown" },
    ]} />
    <div className="grid-main"><TrendChart title="Doanh thu tháng này" data={month.revenueSeries} subtitle={`${month.period.label} · VND`} /><CategoryChart title="Doanh thu theo danh mục" data={month.revenueByCategory} subtitle={`Tỷ trọng tháng này · ${month.period.label}`} /></div>
    <div className="grid-main"><HourChart data={today.hourlyRevenue} subtitle={`Hôm nay · ${today.period.label}`} />
      <Card className="breakfast-card"><div className="flex items-center gap-3"><span className="breakfast-icon"><CircleDollarSign size={23} /></span><div><h2>Dòng tiền tháng này</h2><p className="muted mt-1 text-xs">Tổng hợp từ thanh toán và chi phí thực tế.</p></div></div>
        <div className="breakfast-grid">
          <div><p className="muted text-xs">Doanh thu</p><strong>{currency(month.revenue)}</strong></div><div><p className="muted text-xs">Chi phí</p><strong>{currency(month.expenses)}</strong></div>
          <div><p className="muted text-xs"><WalletCards size={13} /> Tiền mặt</p><strong>{method("Tiền mặt").toFixed(1)}%</strong></div><div><p className="muted text-xs"><ReceiptText size={13} /> Còn lại ước tính</p><strong>{currency(month.estimatedProfit)}</strong></div>
        </div>
      </Card>
    </div>
    <RevenueProductTable products={month.products} subtitle={`${month.period.label} · theo hóa đơn đã thanh toán`} limit={5} />
  </>;
}
