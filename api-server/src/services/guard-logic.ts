import { db } from "../db";
import { idempotencyKeys, kycVerifications, riderPenalties } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

// 1. Idempotency Check (Prevent Double Charge)
export const verifyKey = async (key: string) => {
  const exists = await db.select().from(idempotencyKeys).where(eq(idempotencyKeys.key, key));
  if (exists.length > 0) throw new Error("D"); // Duplicate Request
  await db.insert(idempotencyKeys).values({ key });
};

// 2. KYC Expiry & Status Guard
import { users } from "../db/schema";
export const checkKYCStatus = async (userId: string) => {
  const kyc = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId));
  if (!kyc[0] || kyc[0].expiryDate < new Date()) {
    await db.update(users).set({ role: 'restricted' }).where(eq(users.id, userId));
    return false;
  }
  return true;
};

// 3. GPS Spoof Penalty (Auto-Block)
export const applyRiderPenalty = async (riderId: string, reason: string) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHourq() + 1); // 1 Hour Ban
  await db.insert(riderPenalties).values({ riderId, reason, expiresAt });
};