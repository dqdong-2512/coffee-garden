import { profitSummary, profitTrend, categoryProfit } from "@/data/profit";
import { currency } from "@/lib/utils";
import { Card, CardHeader, PageHeader, Badge } from "@/ui/core/primitives";
import { ProfitTrendChart, ProfitCategoryChart } from "@/ui/owner/charts";
export function ProfitScreen() {
  const { revenue, cogs, operating } = profitSummary;
  const gross = revenue - cogs;
  const net = gross - operating;
  return (
    <>
      <PageHeader
        title="Profit Overview"
        description="A clear picture of what your business earns and what it keeps."
        action={<Badge>September 2026 · month to date</Badge>}
      />
      <div className="profit-top">
        <Card>
          <CardHeader
            title="From revenue to net profit"
            subtitle="Main Branch · 1–14 September 2026 · mock financial summary"
          />
          <div className="profit-equation">
            {[
              ["", "Net revenue", revenue],
              ["−", "Cost of goods sold (COGS)", cogs],
              ["=", "Gross Profit", gross],
              ["−", "Operating Expenses", operating],
              ["=", "Net Profit", net],
            ].map(([symbol, label, value], i) => (
              <div
                key={label}
                className={i === 4 ? "net-row" : i === 2 ? "subtotal-row" : ""}
              >
                <span className="operator">{symbol}</span>
                <span>{label}</span>
                <strong>{currency(Number(value))}</strong>
              </div>
            ))}
          </div>
        </Card>
        <div className="margin-cards">
          <Card>
            <p className="muted text-sm">Gross Margin</p>
            <p className="margin-value">
              {((gross / revenue) * 100).toFixed(1)}
              <span>%</span>
            </p>
            <p className="muted text-xs">Gross profit ÷ net revenue</p>
            <div className="margin-track">
              <span style={{ width: `${(gross / revenue) * 100}%` }} />
            </div>
          </Card>
          <Card>
            <p className="muted text-sm">Net Margin</p>
            <p className="margin-value">
              {((net / revenue) * 100).toFixed(1)}
              <span>%</span>
            </p>
            <p className="muted text-xs">Net profit ÷ net revenue</p>
            <div className="margin-track">
              <span style={{ width: `${(net / revenue) * 100}%` }} />
            </div>
          </Card>
        </div>
      </div>
      <div className="grid-main">
        <ProfitTrendChart data={profitTrend} />
        <ProfitCategoryChart data={categoryProfit} />
      </div>
      <p className="mock-note">
        Illustrative management figures, excluding tax. COGS represents consumed
        ingredients; expense entries track payments and may cover different
        periods.
      </p>
    </>
  );
}
