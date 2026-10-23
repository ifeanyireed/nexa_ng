import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "../ofia_admin/node_modules/@neondatabase/serverless/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const MIGRATION_FILE = path.join(
  ROOT_DIR,
  "database/migrations/011_create_shop_commerce_schema.sql"
);

// Read DATABASE_URL from .env.local or service_erp/.env
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
  console.error("❌ No DATABASE_URL found.");
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

    // Verify tables exist
    const resTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('shop_orders', 'shop_order_items', 'shop_bookings')
      ORDER BY table_name;
    `);

    console.log("\n📊 Verified Created Tables:");
    for (const row of resTables.rows) {
      console.log(`  ✓ Table: ${row.table_name}`);
    }

    // Verify seeded orders count
    const ordersCount = await pool.query(`SELECT COUNT(*) as count FROM shop_orders WHERE tenant_slug = 'neweratransports';`);
    const bookingsCount = await pool.query(`SELECT COUNT(*) as count FROM shop_bookings WHERE tenant_slug = 'neweratransports';`);

    console.log(`\n📦 Seed Verification for 'neweratransports':`);
    console.log(`  ✓ shop_orders rows: ${ordersCount.rows[0].count}`);
    console.log(`  ✓ shop_bookings rows: ${bookingsCount.rows[0].count}`);

    console.log("\n🎉 PostgreSQL Commerce Persistence Schema is LIVE on Neon!");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
