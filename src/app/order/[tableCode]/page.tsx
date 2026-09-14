import { Placeholder } from "@/ui/placeholder";
export default async function Page({
  params,
}: {
  params: Promise<{ tableCode: string }>;
}) {
  const { tableCode } = await params;
  return (
    <Placeholder
      title={`Customer Order · ${tableCode}`}
      description="Browse the menu and order coffee and breakfast from your table."
    />
  );
}
