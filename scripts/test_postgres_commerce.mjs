import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "../ofia_admin/node_modules/@neondatabase/serverless/index.mjs";

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
  console.error("❌ No DATABASE_URL found.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function runTest() {
  console.log("===============================================================");
  console.log("   NEON POSTGRESQL COMMERCE PERSISTENCE VERIFICATION TEST   ");
  console.log("===============================================================\n");

  try {
    // 1. Check existing orders for neweratransports
    console.log("🔹 1. Querying shop_orders from Neon PostgreSQL...");
    const ordersRes = await pool.query(`
      SELECT id, order_number, tenant_slug, customer_name, channel, status, total_amount, created_at
      FROM shop_orders
      WHERE LOWER(tenant_slug) = 'neweratransports'
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    console.log(`  ✓ Found ${ordersRes.rowCount} orders in PostgreSQL`);
    for (const ord of ordersRes.rows) {
      console.log(`    - [${ord.order_number}] ${ord.customer_name} | ${ord.status} | ${ord.total_amount}`);
    }

    // 2. Insert test omnichannel order into Neon
    console.log("\n🔹 2. Creating New Omnichannel Customer Order in Neon PostgreSQL...");
    const testOrderId = `ORD-NEON-${Date.now().toString().slice(-4)}`;
    const testOrderNum = `OFIA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await pool.query(`
      INSERT INTO shop_orders (
        id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
        customer_phone, channel, status, payment_status, delivery_method,
        shipping_address, city, payment_method, items_summary, item_count,
        total_amount, raw_amount, currency, notes, created_at, updated_at
      ) VALUES (
        $1, $2, 'neweratransports', 'org-01', 'Senator Oluremi Tinubu', 'remi.tinubu@state.gov.ng',
        '+234 802 123 4567', 'STOREFRONT', 'IN_PREPARATION', 'PAID', 'DISPATCH',
        'Presidential Villa Annex, Ikoyi, Lagos', 'Lagos', 'card',
        '2024 Mercedes-Benz Maybach S680 4MATIC (Executive Saloon)', 1,
        '₦280,000,000', 280000000, '₦', 'VIP Armored Executive Escort Required',
        NOW(), NOW()
      );
    `, [testOrderId, testOrderNum]);

    console.log(`  ✓ Inserted order ${testOrderNum} (ID: ${testOrderId}) into shop_orders`);

    // 3. Insert relational order item
    await pool.query(`
      INSERT INTO shop_order_items (
        id, order_id, tenant_slug, product_id, title, price, quantity, created_at
      ) VALUES (
        $1, $2, 'neweratransports', 'car-maybach-01',
        '2024 Mercedes-Benz Maybach S680 4MATIC (Executive Saloon)',
        280000000, 1, NOW()
      );
    `, [`ITM-${testOrderId}-1`, testOrderId]);

    console.log(`  ✓ Inserted relational item into shop_order_items`);

    // 4. Update Order Status in PostgreSQL
    console.log("\n🔹 3. Transitioning Order Status (IN_PREPARATION -> READY_DISPATCH -> DELIVERED)...");
    await pool.query(`
      UPDATE shop_orders SET status = 'READY_DISPATCH', updated_at = NOW() WHERE id = $1;
    `, [testOrderId]);

    let check = await pool.query(`SELECT status FROM shop_orders WHERE id = $1;`, [testOrderId]);
    console.log(`  ✓ Advanced to: ${check.rows[0].status}`);

    await pool.query(`
      UPDATE shop_orders SET status = 'DELIVERED', updated_at = NOW() WHERE id = $1;
    `, [testOrderId]);

    check = await pool.query(`SELECT status FROM shop_orders WHERE id = $1;`, [testOrderId]);
    console.log(`  ✓ Fulfilled to: ${check.rows[0].status}`);

    // 5. Test Shop Booking in PostgreSQL
    console.log("\n🔹 4. Testing Service Booking Persistence in Neon PostgreSQL...");
    const testBookingId = `BK-NEON-${Date.now().toString().slice(-4)}`;
    const testBookingNum = `TD-${Math.floor(10000 + Math.random() * 90000)}`;

    await pool.query(`
      INSERT INTO shop_bookings (
        id, booking_number, tenant_slug, customer_name, customer_email,
        customer_phone, service_title, date_time, status, vertical, notes, created_at, updated_at
      ) VALUES (
        $1, $2, 'neweratransports', 'Chief Femi Otedola', 'femi@otedola.com',
        '+234 803 888 7766', 'Exclusive Showroom VIP Preview & Dyno Calibration',
        'Friday at 3:00 PM', 'PENDING', 'cars', 'Verify ceramic brake discs',
        NOW(), NOW()
      );
    `, [testBookingId, testBookingNum]);

    console.log(`  ✓ Inserted booking ${testBookingNum} (ID: ${testBookingId}) into shop_bookings`);

    await pool.query(`
      UPDATE shop_bookings SET status = 'CONFIRMED', updated_at = NOW() WHERE id = $1;
    `, [testBookingId]);

    const bookingCheck = await pool.query(`SELECT status FROM shop_bookings WHERE id = $1;`, [testBookingId]);
    console.log(`  ✓ Confirmed booking status: ${bookingCheck.rows[0].status}`);

    console.log("\n===============================================================");
    console.log("   🎉 ALL NEON POSTGRESQL PERSISTENCE TESTS PASSED (100%)");
    console.log("===============================================================\n");

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    await pool.end();
    process.exit(1);
  }
}

runTest();
