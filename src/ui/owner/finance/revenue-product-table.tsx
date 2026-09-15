import { Coffee, UtensilsCrossed } from "lucide-react";
import type { ProductRevenue } from "@/features/finance/types";
import { currency } from "@/lib/utils";
import { Card, CardHeader, DataTable } from "@/ui/core/primitives";

export function RevenueProductTable({ products, subtitle, limit }: { products: ProductRevenue[]; subtitle: string; limit?: number }) {
  const rows = limit ? products.slice(0, limit) : products;
  return <Card className="table-card">
    <CardHeader title={limit ? "Món bán chạy" : "Doanh thu theo món"} subtitle={subtitle} />
    <DataTable caption="Doanh thu theo món" headers={["Món", "Danh mục", "Số lượng", "Doanh thu đã thu"]}>
      {rows.map((product) => <tr key={`${product.category}-${product.name}`}>
        <td><div className="flex items-center gap-3"><span className="product-icon">{product.category.toLocaleLowerCase().includes("đồ ăn") ? <UtensilsCrossed size={18} /> : <Coffee size={18} />}</span><strong>{product.name}</strong></div></td>
        <td className="muted">{product.category}</td><td>{product.quantity}</td><td className="font-medium">{currency(product.revenue)}</td>
      </tr>)}
      {!rows.length && <tr><td colSpan={4} className="empty-table">Chưa có món nào được thanh toán trong kỳ.</td></tr>}
    </DataTable>
  </Card>;
}
