import Link from "next/link";
import { ArrowLeft, ArrowRight, Coffee, QrCode, TableProperties } from "lucide-react";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
import type { StaffTableDirectory } from "@/features/pos/types";
import { LogoutButton } from "@/ui/auth/logout-button";

export function StaffTableSelection({
  user,
  directory,
}: {
  user: AuthenticatedUser;
  directory: StaffTableDirectory;
}) {
  return (
    <main className="staff-tables-page">
      <header className="staff-tables-header">
        <Link href="/" className="pos-brand">
          <span><Coffee size={21} /></span>
          <div><strong>{directory.branch.name}</strong><small>KHU VỰC NHÂN VIÊN</small></div>
        </Link>
        <div className="staff-tables-user">
          <span>{user.displayName}</span>
          <LogoutButton compact />
        </div>
      </header>

      <section className="staff-tables-content">
        <Link href="/" className="staff-tables-back"><ArrowLeft size={15} /> Trang chủ</Link>
        <div className="staff-tables-heading">
          <div>
            <p>PHỤC VỤ TẠI BÀN</p>
            <h1>Chọn bàn của khách</h1>
            <span>Chọn đúng bàn trước khi thêm món và gửi order đến bếp.</span>
          </div>
          <div className="staff-tables-qr-note">
            <QrCode size={20} />
            <span><strong>Khách tự gọi món?</strong><small>Hướng dẫn khách quét QR đặt tại bàn.</small></span>
          </div>
        </div>

        <div className="staff-table-grid">
          {directory.tables.map((table, index) => (
            <Link
              href={{ pathname: "/pos", query: { table: table.code } }}
              className="staff-table-card"
              key={table.id}
            >
              <span className="staff-table-icon"><TableProperties size={21} /></span>
              <span className="staff-table-order">{String(index + 1).padStart(2, "0")}</span>
              <strong>{table.name}</strong>
              <small>{table.code}</small>
              <span className="staff-table-action">Tạo order <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
