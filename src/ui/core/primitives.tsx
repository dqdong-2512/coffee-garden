import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ArrowUpRight,
  Wallet,
  ShoppingBag,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardMetric } from "@/types";
export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "button",
        variant === "secondary" && "button-secondary",
        className,
      )}
      {...props}
    />
  );
}
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("card", className)}>{children}</section>;
}
export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="muted mt-1 text-xs">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p className="muted mt-2 text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function StatCards({ metrics }: { metrics: DashboardMetric[] }) {
  const icons = [Wallet, ShoppingBag, Receipt, TrendingUp];
  return (
    <div className="stats-grid">
      {metrics.map((m, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Card key={m.label} className="stat">
            <div className="flex items-center justify-between gap-2">
              <p className="muted text-xs font-medium">{m.label}</p>
              <span className={cn("stat-icon", m.tone)}>
                <Icon size={18} />
              </span>
            </div>
            <p className="stat-value">{m.value}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {m.change && (
                <span className="change">
                  <ArrowUpRight size={12} />
                  {m.change}
                </span>
              )}
              <span className="muted">{m.note}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
export function DataTable({
  headers,
  children,
  caption,
}: {
  headers: string[];
  children: ReactNode;
  caption: string;
}) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
