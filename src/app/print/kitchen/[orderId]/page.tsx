import { notFound } from "next/navigation";
import { getPrintableOrder } from "@/features/printing/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { KitchenTicketDocument } from "@/ui/print/kitchen-ticket-document";

export const dynamic = "force-dynamic";
export const metadata = { title: "In phiếu bếp" };

export default async function Page({ params, searchParams }: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { orderId } = await params;
  await requirePageUser(["OWNER", "KITCHEN", "CASHIER"], `/print/kitchen/${orderId}`);
  const order = await getPrintableOrder(orderId);
  if (!order) notFound();
  const { autoprint } = await searchParams;
  return <KitchenTicketDocument order={order} autoPrint={autoprint === "1"} />;
}
