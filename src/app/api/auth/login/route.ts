import { NextResponse } from "next/server";
import { loginSchema, safeNextPath } from "@/features/auth/validation/login";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { homeForUser } from "@/lib/auth/authorization";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "Yêu cầu đăng nhập không hợp lệ." }, { status: 403 });
    }
    const input = loginSchema.safeParse(await request.json());
    if (!input.success) {
      return Response.json(
        { error: input.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
        { status: 400 },
      );
    }

    const user = await prisma.staffUser.findUnique({
      where: { username: input.data.username.toLowerCase() },
      include: { permissionAssignments: { select: { permissionCode: true } } },
    });
    const valid = user?.isActive
      ? await verifyPassword(input.data.password, user.passwordHash)
      : false;
    if (!user || !valid) {
      return Response.json(
        { error: "Tài khoản hoặc mật khẩu chưa đúng." },
        { status: 401 },
      );
    }

    const fallback = homeForUser({
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissionAssignments.map((item) => item.permissionCode),
    });
    const response = NextResponse.json({ redirectTo: safeNextPath(input.data.next, fallback) });
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ id: user.id, role: user.role, sessionVersion: user.sessionVersion }),
      sessionCookieOptions,
    );
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }
    return Response.json(
      { error: "Không thể đăng nhập lúc này. Vui lòng thử lại." },
      { status: 503 },
    );
  }
}
