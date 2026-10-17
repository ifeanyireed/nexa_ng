const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lowercase all emails
    const emailRes = await client.query(`
      UPDATE "User" 
      SET email = LOWER(TRIM(email)) 
      WHERE email != LOWER(TRIM(email)) 
      RETURNING id, email;
    `);
    console.log('✅ Normalized emails count:', emailRes.rowCount);
    if (emailRes.rows.length > 0) {
      console.log('Updated emails:', emailRes.rows);
    }

    // 2. Set default bcrypt hash for users with NULL or empty passwords
    const defaultHash = bcrypt.hashSync('12345678', 10);
    const nullPwRes = await client.query(`
      UPDATE "User" 
      SET password = $1, 
          "updatedAt" = NOW(), 
          updated_at = NOW() 
      WHERE password IS NULL OR password = '' 
      RETURNING id, email, name;
    `, [defaultHash]);

    console.log('✅ Restored passwords count:', nullPwRes.rowCount);
    console.log('Restored users (temporary password: 12345678):', nullPwRes.rows);

    await client.query('COMMIT');
    console.log('🎉 Database migration committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
