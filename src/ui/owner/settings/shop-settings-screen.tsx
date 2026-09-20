"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, FileText, MapPin, Phone } from "lucide-react";
import type { ShopSettings } from "@/features/settings/types";
import { Card, CardHeader, PageHeader } from "@/ui/core/primitives";

export function ShopSettingsScreen({ settings }: { settings: ShopSettings }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/owner/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        address: form.get("address"),
        phone: form.get("phone"),
        taxCode: form.get("taxCode"),
        receiptFooter: form.get("receiptFooter"),
      }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Không thể lưu cấu hình quán.");
      setBusy(false);
      return;
    }
    setSaved(true);
    setBusy(false);
    router.refresh();
  }

  return <>
    <PageHeader title="Cấu hình quán" description="Thông tin dùng trên menu, khu vực quản lý và hóa đơn." />
    <div className="settings-grid">
      <Card>
        <CardHeader title="Thông tin kinh doanh" subtitle="Áp dụng cho chi nhánh MAIN của mô hình một quán" action={<Building2 size={20} />} />
        <form className="management-form settings-form" onSubmit={save}>
          <label>Tên quán<input name="name" defaultValue={settings.name} required minLength={2} maxLength={100} /></label>
          <label>Địa chỉ<textarea name="address" defaultValue={settings.address} rows={2} maxLength={200} placeholder="Địa chỉ hiển thị trên hóa đơn" /></label>
          <div className="form-grid">
            <label>Số điện thoại<input name="phone" type="tel" defaultValue={settings.phone} maxLength={30} placeholder="0901 234 567" /></label>
            <label>Mã số thuế<input name="taxCode" inputMode="numeric" defaultValue={settings.taxCode} maxLength={30} placeholder="Không bắt buộc" /></label>
          </div>
          <label>Lời nhắn cuối hóa đơn<textarea name="receiptFooter" defaultValue={settings.receiptFooter} rows={3} maxLength={200} placeholder="Cảm ơn quý khách và hẹn gặp lại!" /></label>
          {error && <p className="management-alert" role="alert">{error}</p>}
          {saved && <p className="management-success" role="status"><CheckCircle2 size={15} />Đã lưu cấu hình quán.</p>}
          <button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu cấu hình"}</button>
        </form>
      </Card>
      <div className="settings-preview-stack">
        <Card><CardHeader title="Xem trước thông tin" subtitle="Dữ liệu sẽ dùng cho hóa đơn và phiếu in" />
          <div className="shop-preview">
            <span className="shop-preview-logo">CG</span><h2>{settings.name}</h2>
            <p><MapPin size={14} />{settings.address || "Chưa nhập địa chỉ"}</p>
            <p><Phone size={14} />{settings.phone || "Chưa nhập số điện thoại"}</p>
            {settings.taxCode && <p><FileText size={14} />MST: {settings.taxCode}</p>}
            <small>{settings.receiptFooter || "Cảm ơn quý khách và hẹn gặp lại!"}</small>
          </div>
        </Card>
        <Card className="settings-note"><h2>An toàn trước khi vận hành</h2><ul><li>Đổi mật khẩu mặc định của cả ba tài khoản seed.</li><li>Dùng tài khoản riêng cho từng nhân viên.</li><li>Khóa tài khoản ngay khi nhân viên nghỉ việc.</li></ul></Card>
      </div>
    </div>
  </>;
}
