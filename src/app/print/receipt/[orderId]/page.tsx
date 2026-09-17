import { notFound } from "next/navigation";
import { getPrintableOrder } from "@/features/printing/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { ReceiptDocument } from "@/ui/print/receipt-document";

export const dynamic = "force-dynamic";
export const metadata = { title: "In hóa đơn" };

export default async function Page({ params, searchParams }: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { orderId } = await params;
  await requirePageUser(["OWNER", "CASHIER"], `/print/receipt/${orderId}`);
  const order = await getPrintableOrder(orderId);
  if (!order) notFound();
  const { autoprint } = await searchParams;
  return <ReceiptDocument order={order} autoPrint={autoprint === "1"} />;
}
