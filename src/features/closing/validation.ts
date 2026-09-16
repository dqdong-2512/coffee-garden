import { z } from "zod";

const validDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày chốt không hợp lệ.").refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Ngày chốt không hợp lệ.");

export const closeDaySchema = z.object({
  businessDate: validDate,
  openingCash: z.coerce.number().int().min(0, "Tiền đầu ca không được âm.").max(1_000_000_000),
  countedCash: z.coerce.number().int().min(0, "Tiền thực đếm không được âm.").max(1_000_000_000),
  note: z.string().trim().max(300).optional().default(""),
});
