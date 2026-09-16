"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Calculator, CheckCircle2, Download, LockKeyhole, SlidersHorizontal } from "lucide-react";
import type { DailyCloseData } from "@/features/closing/types";
import { currency } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, DataTable, PageHeader, StatCards } from "@/ui/core/primitives";

export function DailyClosingScreen({ data }: { data: DailyCloseData }) {
  const [opening, setOpening] = useState("0"); const [counted, setCounted] = useState("0");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const expected = useMemo(() => (Number(opening) || 0) + data.summary.cashSales - data.summary.cashExpenses, [opening, data.summary.cashSales, data.summary.cashExpenses]);
  const difference = (Number(counted) || 0) - expected;

  async function close(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/owner/daily-closures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      businessDate: data.summary.businessDate, openingCash: Number(opening), countedCash: Number(counted), note: form.get("note"),
    }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Không thể chốt ngày."); setBusy(false); return; }
    window.location.reload();
  }

  const selected = data.existing;
  return <>
    <PageHeader title="Chốt ngày & đối soát" description="Đối chiếu tiền mặt thực đếm với thanh toán, chi phí và order trong ngày." action={<a className="button button-secondary" href="/api/owner/daily-closures/export"><Download size={16} />Xuất CSV</a>} />
    <form className="filter-bar" method="get"><label>Ngày kinh doanh<input name="date" type="date" defaultValue={data.summary.businessDate} required /></label><Button type="submit"><SlidersHorizontal size={15} />Xem ngày</Button></form>
    <p className="mock-note">Số liệu hiện tại cho ngày {data.summary.businessDate.split("-").reverse().join("/")} · order chưa thu được tính theo ngày tạo order.</p>
    <StatCards metrics={[
      { label: "Đã thu", value: currency(data.summary.paidTotal), note: `${data.summary.paymentCount} giao dịch`, tone: "green" },
      { label: "Tiền mặt bán hàng", value: currency(data.summary.cashSales), note: `Chi tiền mặt ${currency(data.summary.cashExpenses)}`, tone: "brown" },
      { label: "Chuyển khoản", value: currency(data.summary.bankTransferTotal), note: "Đã xác nhận", tone: "gold" },
      { label: "Order chưa thu", value: currency(data.summary.unpaidTotal), note: `${data.summary.unpaidOrderCount} order`, tone: "brown" },
    ]} />
    <div className="closing-grid">
      <Card><CardHeader title={selected ? "Phiếu đã chốt" : "Đối chiếu tiền mặt"} subtitle={selected ? `Chốt bởi ${selected.createdBy}` : "Nhập tiền đầu ca và số tiền thực tế trong két"} action={selected ? <Badge>Đã khóa</Badge> : <Calculator size={20} />} />
        {selected ? <div className="closing-result">
          <p><span>Tiền đầu ca</span><strong>{currency(selected.openingCash)}</strong></p><p><span>Bán hàng tiền mặt</span><strong>{currency(selected.cashSales)}</strong></p><p><span>Chi tiền mặt</span><strong>− {currency(selected.cashExpenses)}</strong></p>
          <p className="closing-subtotal"><span>Tiền hệ thống</span><strong>{currency(selected.expectedCash)}</strong></p><p><span>Tiền thực đếm</span><strong>{currency(selected.countedCash)}</strong></p><p className={`closing-difference ${selected.cashDifference ? "has-difference" : ""}`}><span>Chênh lệch</span><strong>{currency(selected.cashDifference)}</strong></p>
          <small><LockKeyhole size={13} /> {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(selected.closedAt))}{selected.note ? ` · ${selected.note}` : ""}</small>
        </div> : <form className="management-form closing-form" onSubmit={close}>
          <div className="form-grid"><label>Tiền mặt đầu ca<input type="number" min={0} max={1000000000} step={1000} value={opening} onChange={(event) => setOpening(event.target.value)} required /></label><label>Tiền mặt thực đếm<input type="number" min={0} max={1000000000} step={1000} value={counted} onChange={(event) => setCounted(event.target.value)} required /></label></div>
          <div className="closing-calculation"><p><span>Đầu ca</span><strong>{currency(Number(opening) || 0)}</strong></p><p><span>+ Bán tiền mặt</span><strong>{currency(data.summary.cashSales)}</strong></p><p><span>− Chi tiền mặt</span><strong>{currency(data.summary.cashExpenses)}</strong></p><p><span>= Tiền hệ thống</span><strong>{currency(expected)}</strong></p><p className={difference ? "has-difference" : ""}><span>Chênh lệch thực đếm</span><strong>{currency(difference)}</strong></p></div>
          <label>Ghi chú<textarea name="note" rows={2} maxLength={300} placeholder="Bàn giao ca, lý do thừa/thiếu…" /></label>
          {error && <p className="management-alert" role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Đang chốt…" : "Xác nhận chốt ngày"}</Button>
        </form>}
      </Card>
      <Card><CardHeader title="Ngoại lệ cần kiểm tra" subtitle="Không làm thay đổi số tiền hệ thống" />
        <div className="closing-exceptions"><div><span>Thanh toán đã hủy</span><strong>{currency(data.summary.voidedTotal)}</strong><small>{data.summary.voidedPaymentCount} giao dịch</small></div><div><span>Order chưa thu</span><strong>{currency(data.summary.unpaidTotal)}</strong><small>{data.summary.unpaidOrderCount} order chưa thanh toán</small></div><div><span>Trạng thái ngày</span><strong className="closing-state">{selected ? <><CheckCircle2 size={18} />Đã chốt</> : "Đang mở"}</strong><small>{selected ? "Số liệu chốt đã được lưu" : "Có thể tiếp tục nhận giao dịch"}</small></div></div>
      </Card>
    </div>
    <Card className="table-card management-table mt-6"><CardHeader title="Lịch sử chốt ngày" subtitle="Mỗi ngày chỉ có một phiếu chốt không chỉnh sửa" action={<Badge>{data.history.length} phiếu</Badge>} />
      <DataTable caption="Lịch sử chốt ngày" headers={["Ngày", "Đã thu", "Tiền hệ thống", "Thực đếm", "Chênh lệch", "Chuyển khoản", "Chưa thu", "Người chốt"]}>
        {data.history.map((row) => <tr key={row.id}><td><strong>{row.businessDate.split("-").reverse().join("/")}</strong></td><td>{currency(row.paidTotal)}</td><td>{currency(row.expectedCash)}</td><td>{currency(row.countedCash)}</td><td className={row.cashDifference ? "stock-negative" : "stock-positive"}>{currency(row.cashDifference)}</td><td>{currency(row.bankTransferTotal)}</td><td>{currency(row.unpaidTotal)}</td><td>{row.createdBy}</td></tr>)}
        {!data.history.length && <tr><td colSpan={8} className="empty-table">Chưa có ngày nào được chốt.</td></tr>}
      </DataTable>
    </Card>
  </>;
}
