import { listDailyClosures } from "@/features/closing/queries";
import { authorizeRequest } from "@/lib/auth/authorization";

export const runtime = "nodejs";

function cell(value: string | number) {
  const raw = String(value);
  const safe = typeof value === "string" && /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, ["OWNER"]); if (auth.response) return auth.response;
  const rows = await listDailyClosures(1000);
  const header = ["Ngày", "Tiền đầu ca", "Bán tiền mặt", "Chi tiền mặt", "Tiền hệ thống", "Tiền thực đếm", "Chênh lệch", "Chuyển khoản", "Tổng đã thu", "Đã hủy", "Chưa thu", "Số giao dịch", "Order chưa thu", "Người chốt", "Thời gian chốt", "Ghi chú"];
  const csv = [header, ...rows.map((row) => [row.businessDate, row.openingCash, row.cashSales, row.cashExpenses, row.expectedCash, row.countedCash, row.cashDifference, row.bankTransferTotal, row.paidTotal, row.voidedTotal, row.unpaidTotal, row.paymentCount, row.unpaidOrderCount, row.createdBy, row.closedAt, row.note ?? ""])].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="coffee-garden-daily-closures.csv"', "Cache-Control": "no-store" } });
}
