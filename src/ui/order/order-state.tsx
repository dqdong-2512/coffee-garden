import Link from "next/link";
import { CheckCircle2, Coffee, Database, MapPin } from "lucide-react";
import type { OrderReceipt } from "@/features/orders/types";
import { formatVnd } from "@/lib/utils";

export function OrderUnavailable({ database = false }: { database?: boolean }) {
  const Icon = database ? Database : MapPin;
  return (
    <main className="customer-state-page">
      <span className="customer-state-icon"><Icon size={30} /></span>
      <p className="customer-kicker">COFFEE GARDEN</p>
      <h1>{database ? "Chưa kết nối database" : "Bàn chưa sẵn sàng"}</h1>
      <p>{database ? "Hãy khởi động PostgreSQL, chạy migration và seed theo README rồi tải lại trang." : "Mã bàn không tồn tại hoặc đang tạm ngưng. Vui lòng quét lại QR hoặc gọi nhân viên."}</p>
      <Link href="/">Về trang phát triển</Link>
    </main>
  );
}

export function OrderSuccess({ receipt }: { receipt: OrderReceipt }) {
  return (
    <main className="customer-success-page">
      <section className="customer-success-card">
        <span className="customer-success-icon"><CheckCircle2 size={36} /></span>
        <p className="customer-kicker">ORDER ĐÃ ĐƯỢC GỬI</p>
        <h1>Cảm ơn bạn!</h1>
        <p>Quán đã nhận order và sẽ chuẩn bị ngay.</p>
        <div className="customer-order-number"><small>MÃ ORDER</small><strong>{receipt.orderNo}</strong><span>{receipt.tableName} · {new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(receipt.createdAt))}</span></div>
        <div className="customer-receipt-lines">
          {receipt.items.map((item, index) => (
            <div key={`${item.productName}-${index}`}>
              <span><b>{item.quantity}×</b> {item.productName}{item.itemNote && <small>{item.itemNote}</small>}</span>
              <strong>{formatVnd(item.lineTotal)}</strong>
            </div>
          ))}
        </div>
        <div className="customer-receipt-total"><span>Tổng cộng</span><strong>{formatVnd(receipt.totalAmount)}</strong></div>
        <Link className="customer-new-order" href={`/order/${receipt.tableCode}`}><Coffee size={18} /> Gọi thêm món</Link>
      </section>
    </main>
  );
}
