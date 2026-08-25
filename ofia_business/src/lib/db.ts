import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;
let isInitialized = false;

function getDatabaseConfig(): mysql.PoolOptions {
  const databaseURL =
    process.env.DATABASE_URL ||
    process.env.DB_DSN ||
    process.env.MYSQL_URL ||
    "mysql://u721451974_nexa:*Reedb4b4@srv2113.hstgr.io:3306/u721451974_nexa_db";

  try {
    // If standard mysql:// URL
    if (databaseURL.startsWith("mysql://") || databaseURL.startsWith("mariadb://")) {
      const url = new URL(databaseURL);
      return {
        host: url.hostname,
        port: parseInt(url.port || "3306", 10),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      };
    }

    // If Go DSN format: user:pass@tcp(host:port)/dbname
    if (databaseURL.includes("@tcp(")) {
      const parts = databaseURL.split("@tcp(");
      const userPass = parts[0].split(":");
      const hostDb = parts[1].split(")/");
      const hostPort = hostDb[0].split(":");
      const dbAndParams = hostDb[1].split("?")[0];

      return {
        host: hostPort[0],
        port: parseInt(hostPort[1] || "3306", 10),
        user: userPass[0],
        password: userPass[1],
        database: dbAndParams,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 60000,
        queueLimit: 0,
      };
    }
  } catch (err) {
    console.warn("⚠️ Failed to parse database URL, using fallback parameters:", err);
  }

  return {
    host: process.env.DB_HOST || "srv2113.hstgr.io",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "u721451974_nexa",
    password: process.env.DB_PASSWORD || "*Reedb4b4",
    database: process.env.DB_NAME || "u721451974_nexa_db",
    waitForConnections: true,
    connectionLimit: 10,
  };
}

export function getDbPool(): mysql.Pool | null {
  if (!pool) {
    try {
      const config = getDatabaseConfig();
      pool = mysql.createPool(config);
    } catch (err) {
      console.warn("⚠️ Failed to initialize MySQL Pool:", err);
      pool = null;
    }
  }
  return pool;
}

export async function ensureTablesExist(): Promise<boolean> {
  if (isInitialized) return true;
  const db = getDbPool();
  if (!db) return false;

  try {
    const connection = await db.getConnection();
    try {
      // 1. waitlist_leads table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS waitlist_leads (
          id VARCHAR(64) PRIMARY KEY,
          queue_number INT NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          business_name VARCHAR(200) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          role VARCHAR(50) DEFAULT 'MERCHANT',
          business_type VARCHAR(100) DEFAULT 'Retail Store',
          tool_type VARCHAR(100) DEFAULT 'Full Ecosystem',
          custom_business_type VARCHAR(200) NULL,
          custom_tool_type VARCHAR(200) NULL,
          niche VARCHAR(50) DEFAULT 'general',
          state VARCHAR(50) DEFAULT 'Lagos',
          city VARCHAR(100) DEFAULT 'Ikeja',
          team_size VARCHAR(50) DEFAULT '1-5',
          features_interest TEXT NULL,
          referral_code VARCHAR(32) UNIQUE NOT NULL,
          referred_by VARCHAR(32) NULL,
          status VARCHAR(30) DEFAULT 'PENDING',
          invite_code VARCHAR(64) NULL,
          notes TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_waitlist_email (email),
          INDEX idx_waitlist_phone (phone),
          INDEX idx_waitlist_status (status),
          INDEX idx_waitlist_referral (referral_code),
          INDEX idx_waitlist_queue (queue_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. contact_inquiries table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id VARCHAR(64) PRIMARY KEY,
          ticket_number VARCHAR(32) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NULL,
          subject VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'MEDIUM',
          status VARCHAR(20) DEFAULT 'OPEN',
          assigned_to VARCHAR(100) NULL,
          resolution_notes TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_contact_status (status),
          INDEX idx_contact_ticket (ticket_number),
          INDEX idx_contact_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      isInitialized = true;
      return true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.warn("⚠️ MySQL database connection check:", err);
    return false;
  }
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = getDbPool();
  if (!db) return null;

  try {
    await ensureTablesExist();
    const [results] = await db.query(sql, params);
    return results as T;
  } catch (err) {
    console.warn("⚠️ MySQL query execution failed, falling back to memory:", err);
    return null;
  }
}
