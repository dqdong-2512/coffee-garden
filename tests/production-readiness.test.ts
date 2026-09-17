import assert from "node:assert/strict";
import test from "node:test";
import { checkProductionConfig } from "../src/lib/config/production-readiness";

const valid = {
  DATABASE_URL: "postgresql://app:secret@pool.example.com:6543/postgres",
  DIRECT_URL: "postgresql://app:secret@db.example.com:5432/postgres",
  PUBLIC_APP_URL: "https://order.coffeegarden.vn",
  AUTH_SESSION_SECRET: "a-unique-production-secret-with-more-than-32-characters",
};

test("accepts a complete production configuration", () => {
  assert.deepEqual(checkProductionConfig(valid), { errors: [], warnings: [] });
});

test("rejects local URLs and placeholder session secrets", () => {
  const result = checkProductionConfig({
    DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/postgres",
    PUBLIC_APP_URL: "http://localhost:3000",
    AUTH_SESSION_SECRET: "coffee-garden-local-session-secret-change-me",
  });
  assert.ok(result.errors.length >= 4);
  assert.ok(checkProductionConfig({ ...valid, PUBLIC_APP_URL: "https://order.your-shop.example" }).errors.length > 0);
});

test("requires distinct non-local passwords for the first production seed", () => {
  const invalid = checkProductionConfig({
    ...valid,
    SEED_OWNER_PASSWORD: "coffee-owner-local",
    SEED_CASHIER_PASSWORD: "same-password-2026",
    SEED_KITCHEN_PASSWORD: "same-password-2026",
  }, true);
  assert.ok(invalid.errors.some((error) => error.includes("local")));
  assert.ok(invalid.errors.some((error) => error.includes("khác nhau")));
  const ready = checkProductionConfig({
    ...valid,
    SEED_OWNER_PASSWORD: "owner-strong-2026",
    SEED_CASHIER_PASSWORD: "cashier-strong-2026",
    SEED_KITCHEN_PASSWORD: "kitchen-strong-2026",
  }, true);
  assert.deepEqual(ready.errors, []);
});
