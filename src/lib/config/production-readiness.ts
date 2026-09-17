type Environment = Record<string, string | undefined>;

export type ProductionCheck = { errors: string[]; warnings: string[] };

const localPasswords = new Set([
  "coffee-owner-local",
  "coffee-kitchen-local",
  "coffee-cashier-local",
]);

function parseUrl(value: string | undefined, protocols: string[]) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return protocols.includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function checkProductionConfig(env: Environment, includeSeed = false): ProductionCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const database = parseUrl(env.DATABASE_URL, ["postgres:", "postgresql:"]);
  const direct = parseUrl(env.DIRECT_URL, ["postgres:", "postgresql:"]);
  const publicApp = parseUrl(env.PUBLIC_APP_URL, ["https:"]);
  const secret = env.AUTH_SESSION_SECRET ?? "";

  if (!database) errors.push("DATABASE_URL phải là URL PostgreSQL hợp lệ.");
  else if (isLocalHost(database.hostname)) errors.push("DATABASE_URL production không được trỏ về localhost.");
  if (!direct) errors.push("DIRECT_URL phải là URL PostgreSQL trực tiếp hợp lệ để chạy migration.");
  else if (isLocalHost(direct.hostname)) errors.push("DIRECT_URL production không được trỏ về localhost.");
  if (database && direct && database.href === direct.href) {
    warnings.push("DATABASE_URL và DIRECT_URL đang giống nhau; hãy xác nhận đây là chủ ý của nhà cung cấp database.");
  }
  if (!publicApp || isLocalHost(publicApp?.hostname ?? "")) {
    errors.push("PUBLIC_APP_URL phải là domain HTTPS công khai.");
  } else if (/example|your-|placeholder|invalid/i.test(publicApp.hostname) || publicApp.username || publicApp.password) {
    errors.push("PUBLIC_APP_URL vẫn có vẻ là domain mẫu hoặc chứa thông tin đăng nhập.");
  } else if (publicApp.pathname !== "/" || publicApp.search || publicApp.hash) {
    errors.push("PUBLIC_APP_URL chỉ được chứa origin, không có path, query hoặc fragment.");
  }
  if (secret.length < 32) errors.push("AUTH_SESSION_SECRET phải có ít nhất 32 ký tự.");
  if (/local|change|example|placeholder/i.test(secret)) errors.push("AUTH_SESSION_SECRET vẫn có vẻ là giá trị mẫu.");

  if (includeSeed) {
    const passwords = [env.SEED_OWNER_PASSWORD, env.SEED_CASHIER_PASSWORD, env.SEED_KITCHEN_PASSWORD];
    if (passwords.some((value) => !value || value.length < 12)) {
      errors.push("Mỗi mật khẩu seed production phải có ít nhất 12 ký tự.");
    }
    if (passwords.some((value) => value && localPasswords.has(value))) {
      errors.push("Không được dùng mật khẩu seed local trên production.");
    }
    if (passwords.filter(Boolean).length === 3 && new Set(passwords).size !== 3) {
      errors.push("Ba tài khoản seed phải dùng ba mật khẩu khác nhau.");
    }
  }
  return { errors, warnings };
}
