import type { FinanceReport } from "@/features/finance/types";
import { currency } from "@/lib/utils";
import { Card, CardHeader, PageHeader, Badge } from "@/ui/core/primitives";
import { ProfitTrendChart, ProfitCategoryChart } from "@/ui/owner/charts";

function percent(value: number, total: number) { return total ? (value / total) * 100 : 0; }
function width(value: number) { return `${Math.max(0, Math.min(100, value))}%`; }

export function ProfitScreen({ report }: { report: FinanceReport }) {
  const afterIngredients = report.grossProfit;
  const ingredientMargin = percent(report.grossProfit, report.revenue);
  const cashMargin = percent(report.estimatedProfit, report.revenue);
  return <>
    <PageHeader title="Lợi nhuận ước tính" description="So sánh doanh thu đã thu với các khoản chi đã ghi nhận trong cùng kỳ." action={<Badge>{report.period.label}</Badge>} />
    <div className="profit-top">
      <Card><CardHeader title="Từ doanh thu đến dòng tiền còn lại" subtitle={`Chi nhánh chính · ${report.period.label}`} />
        <div className="profit-equation">{[
          ["", "Doanh thu đã thu", report.revenue], ["−", "Giá vốn món đã phục vụ", report.cogs], ["=", "Lợi nhuận gộp ước tính", afterIngredients],
          ["−", "Chi phí vận hành khác", report.operatingExpenses], ["=", "Dòng tiền còn lại ước tính", report.estimatedProfit],
        ].map(([symbol, label, value], index) => <div key={String(label)} className={index === 4 ? "net-row" : index === 2 ? "subtotal-row" : ""}>
          <span className="operator">{symbol}</span><span>{label}</span><strong>{currency(Number(value))}</strong>
        </div>)}</div>
      </Card>
      <div className="margin-cards">
        <Card><p className="muted text-sm">Biên lợi nhuận gộp</p><p className="margin-value">{ingredientMargin.toFixed(1)}<span>%</span></p><p className="muted text-xs">Theo định mức và giá vốn lúc phục vụ</p><div className="margin-track"><span style={{ width: width(ingredientMargin) }} /></div></Card>
        <Card><p className="muted text-sm">Tỷ lệ dòng tiền còn lại</p><p className="margin-value">{cashMargin.toFixed(1)}<span>%</span></p><p className="muted text-xs">Dòng tiền ước tính ÷ doanh thu</p><div className="margin-track"><span style={{ width: width(cashMargin) }} /></div></Card>
      </div>
    </div>
    <div className="grid-main"><ProfitTrendChart data={report.profitSeries} subtitle={`${report.period.label} · doanh thu trừ chi theo từng ngày`} /><ProfitCategoryChart data={report.expensesByCategory} /></div>
    <p className="mock-note">Lợi nhuận ước tính dùng giá vốn được chụp lúc order chuyển sang Đã phục vụ. Tiền mua nguyên liệu vẫn xuất hiện ở báo cáo chi phí/dòng tiền và không bị trừ hai lần trong lợi nhuận.</p>
  </>;
}
