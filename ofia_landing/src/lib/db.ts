/**
 * Frontend Database Decoupling Notice:
 *
 * Frontend Next.js applications (@ofia_*) do not communicate directly with the database.
 * All data access is routed through the backend Go microservices (service_erp, service_users, etc.)
 * which maintain secure, pooled connections to Lakebase Postgres / Neon.
 */

export const getDbPool = (): any => {
  throw new Error("Direct database connections are disabled in frontend apps. Use microservice APIs.");
};

export const ensureTablesExist = async (): Promise<boolean> => {
  return true;
};
