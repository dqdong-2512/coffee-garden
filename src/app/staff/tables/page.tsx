import { getStaffTableDirectory } from "@/features/pos/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { StaffTableSelection } from "@/ui/pos/table-selection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chọn bàn phục vụ" };

export default async function Page() {
  const user = await requirePageUser(["ORDER"], "/staff/tables");
  const directory = await getStaffTableDirectory();
  if (!directory) return <main className="pos-state">Không thể tải danh sách bàn.</main>;
  return <StaffTableSelection user={user} directory={directory} />;
}
