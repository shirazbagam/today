import { db } from "./src/db/index";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function findOrCreateAdmin() {
  console.log("🔍 Checking for Admin in Neon DB...");
  
  // 1. Pehle check karo koi admin role wala user hai?
  const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin'));

  if (existingAdmin.length > 0) {
    console.log("✅ Admin Found!");
    console.log("Email:", existingAdmin[0].email);
    console.log("Password: (Aapka set karda purana password)");
  } else {
    console.log("❌ No Admin found. Creating a fresh Super Admin...");
    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@ajkmart.com',
      role: 'admin'
    });
    console.log("🚀 Fresh Admin Created!");
    console.log("Email: admin@ajkmart.com");
    console.log("Password: admin123 (Default)");
  }
  process.exit(0);
}

findOrCreateAdmin();
