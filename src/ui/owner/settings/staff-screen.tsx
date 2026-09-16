"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil, Plus, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import type { StaffRole } from "@/generated/prisma/client";
import type { ManagedStaff } from "@/features/settings/types";
import { Badge, Card, CardHeader, DataTable, PageHeader, StatCards } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

const roleLabels: Record<StaffRole, string> = {
  OWNER: "Owner",
  CASHIER: "Thu ngân",
  KITCHEN: "Bếp & pha chế",
};

type Dialog =
  | { type: "create" }
  | { type: "edit"; staff: ManagedStaff }
  | { type: "password"; staff: ManagedStaff };

export function StaffScreen({ staff, currentUserId }: { staff: ManagedStaff[]; currentUserId: string }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function open(next: Dialog) {
    setError("");
    setDialog(next);
  }

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const editing = dialog?.type === "edit" ? dialog.staff : null;
    const response = await fetch(editing ? `/api/owner/staff/${editing.id}` : "/api/owner/staff", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? {
        displayName: form.get("displayName"),
        role: editing.id === currentUserId ? editing.role : form.get("role"),
        isActive: editing.id === currentUserId ? editing.isActive : form.get("isActive") === "on",
      } : {
        username: form.get("username"),
        displayName: form.get("displayName"),
        role: form.get("role"),
        password: form.get("password"),
      }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Không thể lưu tài khoản.");
      setBusy(false);
      return;
    }
    window.location.reload();
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dialog?.type !== "password") return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) {
      setError("Mật khẩu nhập lại chưa khớp.");
      setBusy(false);
      return;
    }
    const response = await fetch(`/api/owner/staff/${dialog.staff.id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Không thể đổi mật khẩu.");
      setBusy(false);
      return;
    }
    if (dialog.staff.id === currentUserId) {
      router.push("/login?next=%2Fowner%2Fstaff");
      return;
    }
    window.location.reload();
  }

  const active = staff.filter((item) => item.isActive);
  return <>
    <PageHeader
      title="Nhân viên & phân quyền"
      description="Tạo tài khoản riêng cho từng vị trí, khóa quyền truy cập và đặt lại mật khẩu."
      action={<button className="button" onClick={() => open({ type: "create" })}><Plus size={16} />Thêm nhân viên</button>}
    />
    <StatCards metrics={[
      { label: "Đang hoạt động", value: String(active.length), note: `${staff.length} tài khoản`, tone: "green" },
      { label: "Owner", value: String(active.filter((item) => item.role === "OWNER").length), note: "Toàn quyền quản trị", tone: "brown" },
      { label: "Thu ngân", value: String(active.filter((item) => item.role === "CASHIER").length), note: "POS và thanh toán", tone: "gold" },
      { label: "Bếp", value: String(active.filter((item) => item.role === "KITCHEN").length), note: "Xử lý order", tone: "green" },
    ]} />
    <Card className="table-card management-table">
      <CardHeader title="Danh sách tài khoản" subtitle="Mỗi nhân viên nên dùng một tài khoản riêng" action={<Badge>{active.length} hoạt động</Badge>} />
      <DataTable caption="Danh sách tài khoản nhân viên" headers={["Nhân viên", "Tên đăng nhập", "Vai trò", "Trạng thái", "Cập nhật", ""]}>
        {staff.map((item) => <tr key={item.id}>
          <td><div className="management-name"><span><UserRound size={17} /></span><div><strong>{item.displayName}</strong><small>{item.id === currentUserId ? "Tài khoản đang đăng nhập" : `Tạo ${new Intl.DateTimeFormat("vi-VN").format(new Date(item.createdAt))}`}</small></div></div></td>
          <td><code className="staff-username">@{item.username}</code></td>
          <td><Badge>{roleLabels[item.role]}</Badge></td>
          <td><span className={`staff-status ${item.isActive ? "active" : "inactive"}`}><i />{item.isActive ? "Hoạt động" : "Đã khóa"}</span></td>
          <td>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.updatedAt))}</td>
          <td><div className="management-actions">
            <button aria-label={`Đổi mật khẩu ${item.displayName}`} title="Đổi mật khẩu" onClick={() => open({ type: "password", staff: item })}><KeyRound size={15} /></button>
            <button aria-label={`Sửa ${item.displayName}`} title="Sửa tài khoản" onClick={() => open({ type: "edit", staff: item })}><Pencil size={15} /></button>
          </div></td>
        </tr>)}
      </DataTable>
    </Card>
    <div className="role-grid mt-6">
      <Card><ShieldCheck size={20} /><h2>Owner</h2><p>Quản trị toàn bộ dữ liệu, nhân viên, tài chính và cấu hình quán.</p></Card>
      <Card><UsersRound size={20} /><h2>Thu ngân</h2><p>Tạo order tại POS và xác nhận thanh toán; không truy cập báo cáo Owner.</p></Card>
      <Card><UserRound size={20} /><h2>Bếp & pha chế</h2><p>Xem order và cập nhật tiến độ chế biến; không truy cập POS hoặc tài chính.</p></Card>
    </div>
    {(dialog?.type === "create" || dialog?.type === "edit") && <Modal title={dialog.type === "create" ? "Thêm nhân viên" : `Sửa · ${dialog.staff.displayName}`} onClose={() => setDialog(null)}>
      <form className="management-form" onSubmit={saveStaff}>
        {dialog.type === "create" && <label>Tên đăng nhập<input name="username" required minLength={3} maxLength={32} autoComplete="off" placeholder="vi-du: thungan01" /></label>}
        <label>Tên hiển thị<input name="displayName" required minLength={2} maxLength={80} defaultValue={dialog.type === "edit" ? dialog.staff.displayName : ""} /></label>
        <label>Vai trò<select name="role" defaultValue={dialog.type === "edit" ? dialog.staff.role : "CASHIER"} disabled={dialog.type === "edit" && dialog.staff.id === currentUserId}>
          <option value="OWNER">Owner</option><option value="CASHIER">Thu ngân</option><option value="KITCHEN">Bếp & pha chế</option>
        </select></label>
        {dialog.type === "create" && <label>Mật khẩu tạm thời<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Ít nhất 8 ký tự, có chữ và số" /></label>}
        {dialog.type === "edit" && <label className="management-check"><input name="isActive" type="checkbox" defaultChecked={dialog.staff.isActive} disabled={dialog.staff.id === currentUserId} />Cho phép đăng nhập</label>}
        {dialog.type === "edit" && dialog.staff.id === currentUserId && <p className="form-help">Tài khoản đang đăng nhập không thể tự khóa hoặc đổi vai trò.</p>}
        {error && <p className="management-alert" role="alert">{error}</p>}
        <button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu tài khoản"}</button>
      </form>
    </Modal>}
    {dialog?.type === "password" && <Modal title={`Đổi mật khẩu · ${dialog.staff.displayName}`} onClose={() => setDialog(null)}>
      <form className="management-form" onSubmit={savePassword}>
        <p className="form-help">Các phiên đăng nhập cũ của tài khoản này sẽ hết hiệu lực ngay sau khi đổi mật khẩu.</p>
        <label>Mật khẩu mới<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Ít nhất 8 ký tự, có chữ và số" /></label>
        <label>Nhập lại mật khẩu<input name="confirmPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label>
        {error && <p className="management-alert" role="alert">{error}</p>}
        <button className="button" disabled={busy}>{busy ? "Đang đổi…" : "Đổi mật khẩu"}</button>
      </form>
    </Modal>}
  </>;
}
