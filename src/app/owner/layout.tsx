import { requirePageUser } from "@/lib/auth/authorization";
import { OwnerShell } from "@/ui/owner/layout/owner-shell";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser(["OWNER"], "/owner/dashboard");
  return <OwnerShell user={user}>{children}</OwnerShell>;
}
