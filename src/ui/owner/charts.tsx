"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader } from "@/ui/core/primitives";
import { compact, currency } from "@/lib/utils";
import { revenueSeries } from "@/data/revenue";
import type { RevenuePoint, SalesCategory } from "@/types";
const axis = { fontSize: 11, fill: "#8a8c8a" };
export function TrendChart({ title = "Revenue Overview", data, subtitle }: { title?: string; data?: RevenuePoint[]; subtitle?: string }) {
  const [period, setPeriod] = useState<"Day" | "Week" | "Month">("Day");
  const chartData = data ?? revenueSeries[period];
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle ?? (
          period === "Day"
            ? "1–14 September 2026 · VND"
            : period === "Week"
              ? "September 2026 · weekly sample"
              : "April–September 2026 · monthly sample"
        )}
        action={
          data ? <span className="text-xs text-stone-500">Dữ liệu đã thu</span> :
          <div className="segments" aria-label="Chart interval">
            {(["Day", "Week", "Month"] as const).map((p) => (
              <button
                key={p}
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />
      <div className="chart-legend">
        <span>
          <i style={{ background: "#708C5A" }} />
          Doanh thu
        </span>
        {!data && <span>
          <i style={{ background: "#cdc6bb" }} />
          Previous period
        </span>}
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Doanh thu VND theo ${data ? "ngày" : period.toLowerCase()}.`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 240 }}
        >
          <AreaChart
          data={chartData}
            margin={{ top: 10, right: 12, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`revenue-fill-${title.replaceAll(" ", "-")}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#708C5A" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#708C5A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#efeeeb"
            />
            <XAxis
              dataKey="name"
              tick={axis}
              tickLine={false}
              axisLine={false}
              minTickGap={25}
              dy={8}
            />
            <YAxis
              tick={axis}
              tickFormatter={compact}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v) => currency(Number(v))}
              contentStyle={{ borderRadius: 12, borderColor: "#E7E5E4" }}
            />
            {!data && <Area type="monotone" dataKey="previous" name="Previous period" stroke="#c9c1b5" strokeDasharray="5 5" fill="transparent" strokeWidth={2} isAnimationActive={false} />}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#708C5A"
              strokeWidth={2.5}
              fill={`url(#revenue-fill-${title.replaceAll(" ", "-")})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
export function CategoryChart({
  title,
  data,
  subtitle = "Share of revenue · 1–14 Sep 2026",
}: {
  title: string;
  data: SalesCategory[];
  subtitle?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div
        className="donut-wrap"
        role="img"
        aria-label={data.map((d) => `${d.name}: ${d.value}%`).join(", ")}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 300, height: 190 }}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={59}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>
            {total ? 100 : 0}<span>%</span>
          </strong>
          <small>Total sales</small>
        </div>
      </div>
      <div className="category-legend">
        {data.map((d) => (
          <div key={d.name}>
            <span>
              <i style={{ background: d.color }} />
              {d.name}
            </span>
            <strong>{d.value}%</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
export function HourChart({ data, subtitle = "Doanh thu đã thu theo giờ", action = "05:00 – 22:00" }: { data: RevenuePoint[]; subtitle?: string; action?: string }) {
  return (
    <Card>
      <CardHeader
        title="Revenue by Hour"
        subtitle={subtitle}
        action={<span className="text-xs text-stone-500">{action}</span>}
      />
      <div
        className="chart"
        role="img"
        aria-label={data
          .map((d) => `${d.name}: ${currency(d.revenue)}`)
          .join(", ")}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 240 }}
        >
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#efeeeb"
            />
            <XAxis
              dataKey="name"
              tick={axis}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={compact}
              tick={axis}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => currency(Number(v))}
              cursor={{ fill: "#f8f7f4" }}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              radius={[5, 5, 0, 0]}
              maxBarSize={38}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={i === 3 ? "#6B4F3A" : "#bccbb0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-foot"><span className="status-dot" /> Chỉ tính các thanh toán đã hoàn tất.</p>
    </Card>
  );
}
export function ProfitTrendChart({ data, subtitle }: { data: RevenuePoint[]; subtitle?: string }) {
  return (
    <Card>
      <CardHeader
        title="Dòng tiền theo ngày"
        subtitle={subtitle}
      />
      <div className="chart-legend">
        <span>
          <i style={{ background: "#c2b09d" }} />
          Doanh thu đã thu
        </span>
        <span>
          <i style={{ background: "#708C5A" }} />
          Dòng tiền ước tính
        </span>
      </div>
      <div
        className="chart"
        role="img"
        aria-label="Monthly revenue and net profit in VND"
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 240 }}
        >
          <LineChart data={data} margin={{ left: -5, right: 12, top: 12 }}>
            <CartesianGrid
              vertical={false}
              stroke="#efeeeb"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="name"
              tick={axis}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={compact}
              tick={axis}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => currency(Number(v))} />
            <Line
              dataKey="revenue"
              name="Doanh thu đã thu"
              stroke="#c2b09d"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="profit"
              name="Dòng tiền ước tính"
              stroke="#708C5A"
              strokeWidth={3}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
export function ProfitCategoryChart({ data, title = "Chi phí theo nhóm", subtitle = "Theo ngày ghi nhận khoản chi" }: { data: SalesCategory[]; title?: string; subtitle?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
      />
      <div className="space-y-6 py-3">
        {data.map((d) => (
          <div key={d.name}>
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span>{d.name}</span>
              <strong>{currency(d.value)}</strong>
            </div>
            <div className="h-2 rounded-full bg-stone-100">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: d.color,
                }}
              />
            </div>
          </div>
        ))}
        {!data.length && <p className="muted text-sm">Chưa có chi phí trong kỳ này.</p>}
      </div>
    </Card>
  );
}
