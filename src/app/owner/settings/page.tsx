import { getShopSettings } from "@/features/settings/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { ShopSettingsScreen } from "@/ui/owner/settings/shop-settings-screen";

export const metadata = { title: "Cấu hình quán" };

export default async function Page() {
  await requirePageUser(["SUPER_ADMIN"], "/owner/settings");
  return <ShopSettingsScreen settings={await getShopSettings()} />;
}
