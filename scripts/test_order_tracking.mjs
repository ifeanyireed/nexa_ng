// Verification test for live order tracking and reference querying
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "../ofia_storefront/node_modules/@neondatabase/serverless/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envLocalPath = path.join(ROOT_DIR, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, "utf-8");
    const match = content.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (match) databaseUrl = match[1];
  }
}

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL is not set in environment or .env.local");
  process.exit(1);
}

async function main() {
  console.log("=== Testing Order Tracking & Neon Commerce Persistence ===");

  const sql = neon(databaseUrl);

  // 1. Query shop_orders in Neon directly
  const rows = await sql`
    SELECT id, order_number, tenant_slug, customer_name, status, total_amount, shipping_address
    FROM shop_orders
    WHERE order_number = 'OFIA-2026-9021'
    LIMIT 1
  `;

  if (rows.length === 0) {
    console.error("FAIL: Seed order OFIA-2026-9021 not found in Neon database!");
    process.exit(1);
  }

  console.log("✓ Neon Order Lookup OK:", rows[0]);

  // 2. Test status progression simulation
  const testStatus = "READY_DISPATCH";
  await sql`
    UPDATE shop_orders
    SET status = ${testStatus}, updated_at = NOW()
    WHERE order_number = 'OFIA-2026-9021'
  `;

  const updatedRows = await sql`
    SELECT id, order_number, status FROM shop_orders WHERE order_number = 'OFIA-2026-9021'
  `;

  if (updatedRows[0].status !== testStatus) {
    console.error("FAIL: Status update did not persist to Neon!");
    process.exit(1);
  }
  console.log("✓ Neon Status Update to READY_DISPATCH OK:", updatedRows[0]);

  // Restore back to IN_PREPARATION
  await sql`
    UPDATE shop_orders
    SET status = 'IN_PREPARATION', updated_at = NOW()
    WHERE order_number = 'OFIA-2026-9021'
  `;
  console.log("✓ Restored order status to IN_PREPARATION in Neon");

  console.log("\nALL VERIFICATIONS PASSED (100%)");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
