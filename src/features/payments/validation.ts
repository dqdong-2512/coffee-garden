import { z } from "zod";

export const paymentSchema = z.object({
  orderId: z.uuid("Mã order không hợp lệ."),
  method: z.enum(["CASH", "BANK_TRANSFER"]),
  reference: z.string().trim().max(100).optional(),
  note: z.string().trim().max(200).optional(),
});

export const voidPaymentSchema = z.object({
  reason: z.string().trim().min(3, "Vui lòng nhập lý do hủy thanh toán.").max(200),
});
