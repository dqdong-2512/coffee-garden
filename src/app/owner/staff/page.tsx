import { listStaff } from "@/features/settings/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { StaffScreen } from "@/ui/owner/settings/staff-screen";

export const metadata = { title: "Nhân viên" };

export default async function Page() {
  const user = await requirePageUser(["OWNER"], "/owner/staff");
  return <StaffScreen staff={await listStaff()} currentUserId={user.id} />;
}
