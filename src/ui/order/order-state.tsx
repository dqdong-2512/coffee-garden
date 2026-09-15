import Link from "next/link";
import { Database, MapPin } from "lucide-react";
import type { OrderReceipt } from "@/features/orders/types";
import { OrderProgress } from "./order-progress";

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
      <OrderProgress initialReceipt={receipt} />
    </main>
  );
}
