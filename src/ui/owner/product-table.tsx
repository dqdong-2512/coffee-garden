import { Coffee, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { products } from "@/data/products";
import { currency } from "@/lib/utils";
import { Card, CardHeader, DataTable, Badge } from "@/ui/core/primitives";
export function ProductTable({ detailed = false }: { detailed?: boolean }) {
  return (
    <Card className="table-card">
      <CardHeader
        title={detailed ? "Revenue by Product" : "Top Selling Products"}
        subtitle="1–14 September 2026 · top 5 products"
        action={
          <Link href="/owner/products" className="text-link">
            View products ↗
          </Link>
        }
      />
      <DataTable
        caption="Product performance"
        headers={
          detailed
            ? ["Product", "Qty", "Revenue", "Cost", "Gross Profit", "Margin"]
            : [
                "Product",
                "Category",
                "Qty Sold",
                "Revenue",
                "Gross Profit",
                "Margin",
              ]
        }
      >
        {[...products]
          .sort((a, b) => b.quantity - a.quantity)
          .map((p) => (
            <tr key={p.name}>
              <td>
                <div className="flex items-center gap-3">
                  <span
                    className={`product-icon ${p.category === "Breakfast" ? "green" : ""}`}
                  >
                    {p.category === "Breakfast" ? (
                      <UtensilsCrossed size={18} />
                    ) : (
                      <Coffee size={18} />
                    )}
                  </span>
                  <span className="font-medium">
                    {p.name}
                    {detailed && (
                      <small className="muted mt-1 block">{p.category}</small>
                    )}
                  </span>
                </div>
              </td>
              {!detailed && <td className="muted">{p.category}</td>}
              <td>{p.quantity}</td>
              <td className="font-medium">{currency(p.revenue)}</td>
              {detailed && <td>{currency(p.cost)}</td>}
              <td>{currency(p.revenue - p.cost)}</td>
              <td>
                <Badge>
                  {(((p.revenue - p.cost) / p.revenue) * 100).toFixed(1)}%
                </Badge>
              </td>
            </tr>
          ))}
      </DataTable>
    </Card>
  );
}
