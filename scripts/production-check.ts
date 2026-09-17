import "dotenv/config";
import { checkProductionConfig } from "../src/lib/config/production-readiness";

const includeSeed = process.argv.includes("--with-seed");
const result = checkProductionConfig(process.env, includeSeed);

for (const warning of result.warnings) console.warn(`CẢNH BÁO: ${warning}`);
if (result.errors.length) {
  for (const error of result.errors) console.error(`LỖI: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Production config hợp lệ${includeSeed ? " (bao gồm tài khoản seed)" : ""}.`);
}
