import { redirect } from "next/navigation";
import type { StaffPermissionCode, StaffRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { readPageSession, readRequestSession } from "./session";

export type AuthenticatedUser = {
  id: string;
  username: string;
  displayName: string;
  role: StaffRole;
  isSuperAdmin: boolean;
  permissions: StaffPermissionCode[];
};

export type AccessRequirement = StaffPermissionCode | "SUPER_ADMIN";

export function hasAccess(user: AuthenticatedUser, requirements: AccessRequirement[]) {
  if (user.isSuperAdmin) return true;
  return requirements.some(
    (requirement) => requirement !== "SUPER_ADMIN" && user.permissions.includes(requirement),
  );
}

export function homeForUser(user: Pick<AuthenticatedUser, "isSuperAdmin" | "permissions">) {
  if (user.isSuperAdmin || user.permissions.includes("AUDIT")) return "/owner/dashboard";
  if (user.permissions.includes("ORDER")) return "/staff/tables";
  if (user.permissions.includes("KITCHEN")) return "/kitchen";
  return "/login";
}

async function activeUser(session: { sub: string; role: StaffRole; ver: number } | null) {
  if (!session) return null;
  const user = await prisma.staffUser.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      isSuperAdmin: true,
      isActive: true,
      sessionVersion: true,
      permissionAssignments: { select: { permissionCode: true } },
    },
  });
  if (!user?.isActive || user.role !== session.role || user.sessionVersion !== session.ver) return null;
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin,
    permissions: user.permissionAssignments.map((item) => item.permissionCode),
  } satisfies AuthenticatedUser;
}

export async function getPageUser() {
  return activeUser(await readPageSession());
}

export async function requirePageUser(requirements: AccessRequirement[], nextPath: string) {
  const user = await getPageUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!hasAccess(user, requirements)) {
    redirect(homeForUser(user));
  }
  return user;
}

export async function authorizeRequest(request: Request, requirements: AccessRequirement[]) {
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
  if (!hasAccess(user, requirements)) {
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
