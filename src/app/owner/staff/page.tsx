import { listPermissionDefinitions, listStaff } from "@/features/settings/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { StaffScreen } from "@/ui/owner/settings/staff-screen";

export const metadata = { title: "Nhân viên" };

export default async function Page() {
  const user = await requirePageUser(["SUPER_ADMIN"], "/owner/staff");
  const [staff, permissions] = await Promise.all([listStaff(), listPermissionDefinitions()]);
  return <StaffScreen staff={staff} permissionDefinitions={permissions} currentUserId={user.id} />;
}
