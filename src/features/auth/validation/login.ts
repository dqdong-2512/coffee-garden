import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tài khoản.").max(50),
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(200),
  next: z.string().optional(),
});

export function safeNextPath(value: string | undefined, fallback: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
