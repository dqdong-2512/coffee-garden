import { z } from "zod";

const displayName = z.string().trim().min(2, "Tên hiển thị phải có ít nhất 2 ký tự.").max(80);
const role = z.enum(["OWNER", "CASHIER", "KITCHEN"], "Vai trò không hợp lệ.");
const password = z.string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
  .max(128, "Mật khẩu không được dài quá 128 ký tự.")
  .regex(/[A-Za-zÀ-ỹ]/u, "Mật khẩu phải có ít nhất một chữ cái.")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất một chữ số.");

export const createStaffSchema = z.object({
  username: z.string().trim().toLowerCase()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(32)
    .regex(/^[a-z0-9._-]+$/, "Tên đăng nhập chỉ dùng chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang."),
  displayName,
  role,
  password,
});

export const updateStaffSchema = z.object({
  displayName: displayName.optional(),
  role: role.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "Không có thay đổi để lưu.",
});

export const resetStaffPasswordSchema = z.object({ password });

export const updateShopSettingsSchema = z.object({
  name: z.string().trim().min(2, "Tên quán phải có ít nhất 2 ký tự.").max(100),
  address: z.string().trim().max(200),
  phone: z.string().trim().max(30).refine(
    (value) => !value || /^[+0-9 ().-]{8,30}$/.test(value),
    "Số điện thoại không hợp lệ.",
  ),
  taxCode: z.string().trim().max(30).refine(
    (value) => !value || /^[0-9-]{10,14}$/.test(value),
    "Mã số thuế không hợp lệ.",
  ),
  receiptFooter: z.string().trim().max(200),
});
