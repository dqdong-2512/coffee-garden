import QRCode from "qrcode";
import { authorizeRequest } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const auth = await authorizeRequest(request, ["AUDIT"]);
  if (auth.response) return auth.response;
  const { tableId } = await params;
  const table = await prisma.diningTable.findFirst({
    where: { id: tableId, branch: { code: "MAIN" } },
    select: { code: true },
  });
  if (!table) return Response.json({ error: "Không tìm thấy bàn." }, { status: 404 });

  const configuredBase = process.env.PUBLIC_APP_URL?.replace(/\/$/, "");
  const baseUrl = configuredBase || new URL(request.url).origin;
  const orderUrl = `${baseUrl}/order/${table.code}`;
  const svg = await QRCode.toString(orderUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#263b2d", light: "#ffffff" },
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="coffee-garden-${table.code}.svg"`,
      "Cache-Control": "private, no-store",
      "X-Order-Url": orderUrl,
    },
  });
}
