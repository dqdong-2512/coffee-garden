import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { StaffRole } from "@/generated/prisma/client";

export const SESSION_COOKIE = "coffee_garden_session";
export const SESSION_MAX_AGE = 60 * 60 * 12;

export type SessionPayload = {
  sub: string;
  role: StaffRole;
  ver: number;
  exp: number;
};

function sessionSecret() {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: { id: string; role: StaffRole; sessionVersion: number }) {
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    ver: user.sessionVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const expected = Buffer.from(sign(encoded), "utf8");
    const actual = Buffer.from(signature, "utf8");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;
    if (
      typeof payload.sub !== "string" ||
      !["OWNER", "KITCHEN", "CASHIER"].includes(payload.role ?? "") ||
      typeof payload.ver !== "number" ||
      !Number.isInteger(payload.ver) ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function readPageSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function readRequestSession(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${SESSION_COOKIE}=`));
  return verifySessionToken(cookie?.slice(SESSION_COOKIE.length + 1));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
