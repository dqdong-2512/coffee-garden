"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil, Plus, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import type { StaffPermissionCode } from "@/generated/prisma/client";
import type { ManagedStaff, PermissionDefinition } from "@/features/settings/types";
import { Badge, Card, CardHeader, DataTable, PageHeader, StatCards } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

type Dialog =
  | { type: "create" }
  | { type: "edit"; staff: ManagedStaff }
  | { type: "password"; staff: ManagedStaff };

export function StaffScreen({
  staff,
  permissionDefinitions,
  currentUserId,
}: {
  staff: ManagedStaff[];
  permissionDefinitions: PermissionDefinition[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const labels = Object.fromEntries(
    permissionDefinitions.map((permission) => [permission.code, permission.name]),
  ) as Record<StaffPermissionCode, string>;

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
    const body = editing ? {
      displayName: form.get("displayName"),
      ...(editing.isSuperAdmin ? {} : {
        permissions: form.getAll("permissions"),
        isActive: form.get("isActive") === "on",
      }),
    } : {
      username: form.get("username"),
      displayName: form.get("displayName"),
      permissions: form.getAll("permissions"),
      password: form.get("password"),
    };
    const response = await fetch(editing ? `/api/owner/staff/${editing.id}` : "/api/owner/staff", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
  const accessCount = (permission: StaffPermissionCode) =>
    active.filter((item) => item.isSuperAdmin || item.permissions.includes(permission)).length;

  return <>
    <PageHeader
      title="Nhân viên & phân quyền"
      description="Mỗi nhân viên có tài khoản riêng và có thể được cấp nhiều quyền theo công việc thực tế."
      action={<button className="button" onClick={() => open({ type: "create" })}><Plus size={16} />Thêm nhân viên</button>}
    />
    <StatCards metrics={[
      { label: "Đang hoạt động", value: String(active.length), note: `${staff.length} tài khoản`, tone: "green" },
      { label: "Quyền gọi món", value: String(accessCount("ORDER")), note: "Chọn bàn và dùng POS", tone: "gold" },
      { label: "Quyền kiểm toán", value: String(accessCount("AUDIT")), note: "Báo cáo và vận hành", tone: "brown" },
      { label: "Quyền bếp", value: String(accessCount("KITCHEN")), note: "Xử lý order", tone: "green" },
    ]} />
    <Card className="table-card management-table">
      <CardHeader title="Danh sách nhân viên" subtitle="Tên đăng nhập do quán cấp cho từng người" action={<Badge>{active.length} hoạt động</Badge>} />
      <DataTable caption="Danh sách tài khoản nhân viên" headers={["Nhân viên", "Tên đăng nhập", "Phân quyền", "Trạng thái", "Cập nhật", ""]}>
        {staff.map((item) => <tr key={item.id}>
          <td><div className="management-name"><span><UserRound size={17} /></span><div><strong>{item.displayName}</strong><small>{item.id === currentUserId ? "Tài khoản đang đăng nhập" : `Tạo ${new Intl.DateTimeFormat("vi-VN").format(new Date(item.createdAt))}`}</small></div></div></td>
          <td><code className="staff-username">@{item.username}</code></td>
          <td><div className="staff-permission-badges">
            {item.isSuperAdmin
              ? <Badge>Super Admin · Toàn quyền</Badge>
              : item.permissions.map((permission) => <Badge key={permission}>{labels[permission] ?? permission}</Badge>)}
          </div></td>
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
      <Card><ShieldCheck size={20} /><h2>Super Admin</h2><p>Tài khoản duy nhất của chủ quán, luôn có toàn quyền và không thể bị khóa hoặc hạ quyền.</p></Card>
      {permissionDefinitions.map((permission) => <Card key={permission.code}><UsersRound size={20} /><h2>{permission.name}</h2><p>{permission.description}</p></Card>)}
    </div>
    {(dialog?.type === "create" || dialog?.type === "edit") && <Modal title={dialog.type === "create" ? "Thêm nhân viên" : `Sửa · ${dialog.staff.displayName}`} onClose={() => setDialog(null)}>
      <form className="management-form" onSubmit={saveStaff}>
        {dialog.type === "create" && <label>Tên đăng nhập<input name="username" required minLength={3} maxLength={32} autoComplete="off" placeholder="Ví dụ: dqdong" /></label>}
        <label>Họ và tên nhân viên<input name="displayName" required minLength={2} maxLength={80} defaultValue={dialog.type === "edit" ? dialog.staff.displayName : ""} placeholder="Ví dụ: Dương Quí Đồng" /></label>
        {dialog.type === "edit" && dialog.staff.isSuperAdmin ? (
          <div className="super-admin-notice"><ShieldCheck size={18} /><span><strong>Super Admin duy nhất</strong><small>Tài khoản này mặc định có toàn quyền và không thể bị khóa hoặc thay đổi phân quyền.</small></span></div>
        ) : (
          <fieldset className="staff-permission-fieldset">
            <legend>Phân quyền nhân viên</legend>
            {permissionDefinitions.map((permission, index) => <label key={permission.code}>
              <input
                name="permissions"
                type="checkbox"
                value={permission.code}
                defaultChecked={dialog.type === "edit" ? dialog.staff.permissions.includes(permission.code) : index === 0}
              />
              <span><strong>{permission.name}</strong><small>{permission.description}</small></span>
            </label>)}
          </fieldset>
        )}
        {dialog.type === "create" && <label>Mật khẩu tạm thời<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Ít nhất 8 ký tự, có chữ và số" /></label>}
        {dialog.type === "edit" && !dialog.staff.isSuperAdmin && <label className="management-check"><input name="isActive" type="checkbox" defaultChecked={dialog.staff.isActive} disabled={dialog.staff.id === currentUserId} />Cho phép đăng nhập</label>}
        {dialog.type === "edit" && dialog.staff.id === currentUserId && !dialog.staff.isSuperAdmin && <p className="form-help">Tài khoản đang đăng nhập không thể tự khóa.</p>}
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
