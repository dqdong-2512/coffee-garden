"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Armchair, Download, ExternalLink, Pencil, Plus, QrCode } from "lucide-react";
import type { ManagedTable } from "@/features/management/types";
import { Badge, Card, DataTable, PageHeader } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

type TableResponse = { table?: Omit<ManagedTable, "orderCount">; error?: string };

export function TablesScreen({ initialTables, shopName }: { initialTables: ManagedTable[]; shopName: string }) {
  const [tables, setTables] = useState(initialTables);
  const [editing, setEditing] = useState<ManagedTable | null | undefined>(undefined);
  const [qrTable, setQrTable] = useState<ManagedTable | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch(editing ? `/api/owner/tables/${editing.id}` : "/api/owner/tables", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.get("code"), name: data.get("name"), isActive: data.get("isActive") === "on" }),
    });
    const result = (await response.json()) as TableResponse;
    if (!response.ok || !result.table) {
      setError(result.error ?? "Không thể lưu bàn.");
      setBusy(false);
      return;
    }
    const saved = { ...result.table, orderCount: editing?.orderCount ?? 0 };
    setTables((items) => editing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved].sort((a, b) => a.code.localeCompare(b.code)));
    setEditing(undefined);
    setBusy(false);
  }

  return (
    <>
      <PageHeader
        title="Bàn & mã QR"
        description={`${tables.filter((item) => item.isActive).length} bàn đang hoạt động · mỗi QR mở đúng menu của bàn.`}
        action={<button className="button" onClick={() => setEditing(null)}><Plus size={16} />Thêm bàn</button>}
      />
      {error && <p className="management-alert" role="alert">{error}</p>}
      <Card className="table-card management-table">
        <DataTable caption="Danh sách bàn" headers={["Bàn", "Mã order", "Order đã tạo", "Trạng thái", "QR", "Thao tác"]}>
          {tables.map((table) => (
            <tr key={table.id}>
              <td><div className="management-name"><span><Armchair size={17} /></span><strong>{table.name}</strong></div></td>
              <td><code>{table.code}</code></td><td>{table.orderCount}</td>
              <td><Badge>{table.isActive ? "Đang dùng" : "Tạm ngưng"}</Badge></td>
              <td><button className="text-link management-qr-button" onClick={() => setQrTable(table)}><QrCode size={15} />Xem QR</button></td>
              <td><div className="management-actions"><button aria-label={`Sửa ${table.name}`} onClick={() => setEditing(table)}><Pencil size={15} /></button></div></td>
            </tr>
          ))}
        </DataTable>
      </Card>
      {editing !== undefined && (
        <Modal title={editing ? "Sửa bàn" : "Thêm bàn"} onClose={() => setEditing(undefined)}>
          <form className="management-form" onSubmit={save}>
            <div className="form-grid">
              <label>Mã bàn<input name="code" placeholder="T13" pattern="T[0-9]{2}" defaultValue={editing?.code} required /></label>
              <label>Tên hiển thị<input name="name" placeholder="Bàn 13" defaultValue={editing?.name} required maxLength={80} /></label>
            </div>
            <label className="management-check"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} />Cho phép khách order tại bàn này</label>
            {error && <p className="management-alert" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu bàn"}</button>
          </form>
        </Modal>
      )}
      {qrTable && (
        <Modal title={`QR ${qrTable.name}`} onClose={() => setQrTable(null)}>
          <div className="table-qr-card">
            <Image unoptimized width={260} height={260} src={`/api/owner/tables/${qrTable.id}/qr`} alt={`Mã QR order ${qrTable.name}`} />
            <strong>{shopName} · {qrTable.name}</strong>
            <code>/order/{qrTable.code}</code>
            <p>In mã này và đặt trên bàn. Khách quét sẽ mở menu đúng mã bàn.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a className="button" href={`/api/owner/tables/${qrTable.id}/qr`} download={`coffee-garden-${qrTable.code}.svg`}><Download size={16} />Tải SVG</a>
              <a className="button button-secondary" href={`/order/${qrTable.code}`} target="_blank" rel="noreferrer"><ExternalLink size={16} />Mở menu</a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
