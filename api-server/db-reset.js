const postgres = require('postgres');
const connectionString = "postgresql://neondb_owner:npg_s6YEp4qkXPDz@ep-blue-cake-amu6yuja-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString);

async function reset() {
  console.log("💣 Cleaning old tables and constraints...");
  try {
    // Drop existing tables to clear foreign key conflicts
    await sql`DROP TABLE IF EXISTS ride_bids, rides, wallet_transactions, audit_logs, promo_codes, users CASCADE`;
    console.log("✅ Database is clean!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  }
}
reset();
