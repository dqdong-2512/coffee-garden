import { z } from "zod";

export const expenseCategories = [
  "INGREDIENT", "SALARY", "ELECTRICITY", "WATER", "RENT", "MARKETING", "EQUIPMENT", "OTHER",
] as const;

export const createExpenseSchema = z.object({
  category: z.enum(expenseCategories, "Vui lòng chọn nhóm chi phí."),
  amount: z.coerce.number().int("Số tiền phải là số nguyên.").min(1, "Số tiền phải lớn hơn 0.").max(1_000_000_000),
  incurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày chi không hợp lệ.").refine(
    (value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
    },
    "Ngày chi không hợp lệ.",
  ),
  supplier: z.string().trim().min(2, "Nhà cung cấp phải có ít nhất 2 ký tự.").max(120),
  description: z.string().trim().min(2, "Nội dung phải có ít nhất 2 ký tự.").max(300),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
});
