import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "../ofia_storefront/node_modules/@neondatabase/serverless/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const MIGRATION_FILE = path.join(
  ROOT_DIR,
  "database/migrations/012_create_shop_inventory_schema.sql"
);

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

console.log("🐘 Connecting to Neon PostgreSQL via Pool...");
const pool = new Pool({ connectionString: databaseUrl });

async function runMigration() {
  try {
    console.log(`📄 Reading migration: ${path.basename(MIGRATION_FILE)}`);
    const sqlContent = fs.readFileSync(MIGRATION_FILE, "utf-8");

    console.log("⚡ Executing DDL statements on Neon PostgreSQL...");
    await pool.query(sqlContent);

    console.log("✓ Migration executed successfully!");

    // Verify
    const res = await pool.query(`
      SELECT id, tenant_slug, product_name, current_stock, min_stock, status
      FROM shop_inventory
      ORDER BY tenant_slug, id;
    `);

    console.log(`\n✓ Verified ${res.rowCount} inventory records in Neon:`);
    for (const r of res.rows) {
      console.log(`  - [${r.tenant_slug}] ${r.product_name} | Stock: ${r.current_stock} (Min: ${r.min_stock}) | Status: ${r.status}`);
    }

    await pool.end();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
