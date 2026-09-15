import { getCustomerCatalog } from "@/features/catalog/queries/get-customer-catalog";
import { CustomerOrderApp } from "@/ui/order/customer-order-app";
import { OrderUnavailable } from "@/ui/order/order-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gọi món" };

async function loadCatalog(tableCode: string) {
  try {
    return { catalog: await getCustomerCatalog(tableCode), databaseError: false };
  } catch {
    return { catalog: null, databaseError: true };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ tableCode: string }>;
}) {
  const { tableCode } = await params;
  const { catalog, databaseError } = await loadCatalog(tableCode);
  return catalog ? <CustomerOrderApp catalog={catalog} /> : <OrderUnavailable database={databaseError} />;
}
