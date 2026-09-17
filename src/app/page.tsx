import { redirect } from "next/navigation";
import { DevHome } from "@/ui/placeholder";
export default function Page() {
  if (process.env.NODE_ENV === "production") redirect("/login");
  return <DevHome />;
}
