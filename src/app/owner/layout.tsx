import { getShopSettings } from "@/features/settings/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { OwnerShell } from "@/ui/owner/layout/owner-shell";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, shop] = await Promise.all([
    requirePageUser(["OWNER"], "/owner/dashboard"),
    getShopSettings(),
  ]);
  return <OwnerShell user={user} shopName={shop.name}>{children}</OwnerShell>;
}
