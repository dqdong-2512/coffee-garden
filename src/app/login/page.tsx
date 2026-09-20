import { redirect } from "next/navigation";
import { getPageUser, homeForUser } from "@/lib/auth/authorization";
import { LoginForm } from "@/ui/auth/login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đăng nhập" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getPageUser();
  if (user) redirect(homeForUser(user));
  const { next } = await searchParams;
  return <LoginForm nextPath={next} />;
}
