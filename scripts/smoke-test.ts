export {};

const input = process.argv[2] || process.env.PUBLIC_APP_URL;
if (!input) throw new Error("Truyền URL cần kiểm tra, ví dụ: npm run production:smoke -- https://example.com");
const targetOrigin = new URL(input).origin;
const response = await fetch(`${targetOrigin}/api/health`, { signal: AbortSignal.timeout(10_000) });
const body = await response.json() as { status?: string; database?: string };
if (!response.ok || body.status !== "ok" || body.database !== "ok") {
  throw new Error(`Health check thất bại (${response.status}): ${JSON.stringify(body)}`);
}
console.log(`Smoke test đạt: ${targetOrigin}/api/health`);
