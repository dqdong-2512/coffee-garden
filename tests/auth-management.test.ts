import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { safeNextPath } from "../src/features/auth/validation/login";
import {
  createProductSchema,
  createTableSchema,
} from "../src/features/management/validation";

test("hashes staff passwords with a unique salt and verifies them", async () => {
  const first = await hashPassword("coffee-owner-local");
  const second = await hashPassword("coffee-owner-local");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("coffee-owner-local", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("signs and rejects tampered staff session tokens", async () => {
  process.env.AUTH_SESSION_SECRET = "test-session-secret-with-more-than-32-characters";
  const { createSessionToken, verifySessionToken } = await import(
    "../src/lib/auth/session"
  );
  const token = createSessionToken({
    id: "11111111-1111-4111-8111-111111111111",
    role: "OWNER",
  });
  assert.equal(verifySessionToken(token)?.role, "OWNER");
  assert.equal(verifySessionToken(`${token}tampered`), null);
});

test("only accepts local redirect paths after login", () => {
  assert.equal(safeNextPath("/owner/products", "/owner/dashboard"), "/owner/products");
  assert.equal(safeNextPath("//evil.example", "/owner/dashboard"), "/owner/dashboard");
  assert.equal(safeNextPath("https://evil.example", "/kitchen"), "/kitchen");
});

test("normalizes table codes and validates menu prices", () => {
  const table = createTableSchema.parse({ code: " t13 ", name: "Bàn 13" });
  assert.equal(table.code, "T13");
  assert.equal(
    createProductSchema.safeParse({
      categoryId: "11111111-1111-4111-8111-111111111111",
      name: "Trà đào",
      price: 500,
    }).success,
    false,
  );
});
