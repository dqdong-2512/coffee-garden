import { redirect } from "next/navigation";
import type { StaffRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { readPageSession, readRequestSession } from "./session";

export type AuthenticatedUser = {
  id: string;
  username: string;
  displayName: string;
  role: StaffRole;
};

export function homeForRole(role: StaffRole) {
  if (role === "OWNER") return "/owner/dashboard";
  if (role === "KITCHEN") return "/kitchen";
  return "/pos";
}

async function activeUser(session: { sub: string; role: StaffRole; ver: number } | null) {
  if (!session) return null;
  const user = await prisma.staffUser.findUnique({
    where: { id: session.sub },
    select: { id: true, username: true, displayName: true, role: true, isActive: true, sessionVersion: true },
  });
  if (!user?.isActive || user.role !== session.role || user.sessionVersion !== session.ver) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  } satisfies AuthenticatedUser;
}

export async function getPageUser() {
  return activeUser(await readPageSession());
}

export async function requirePageUser(roles: StaffRole[], nextPath: string) {
  const user = await getPageUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!roles.includes(user.role)) {
    redirect(homeForRole(user.role));
  }
  return user;
}

export async function authorizeRequest(request: Request, roles: StaffRole[]) {
  const user = await activeUser(readRequestSession(request));
  if (!user) {
    return {
      user: null,
      response: Response.json(
        { code: "UNAUTHENTICATED", error: "Vui lòng đăng nhập lại." },
        { status: 401 },
      ),
    } as const;
  }
  if (!roles.includes(user.role)) {
    return {
      user: null,
      response: Response.json(
        { code: "FORBIDDEN", error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 403 },
      ),
    } as const;
  }
  return { user, response: null } as const;
}
