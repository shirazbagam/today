import { db } from "../db";
import { auditLogs } from "../db/schema";

const SENSITIVE_KEYS = ['password', 'otp', 'token', 'credit_card'];

export const safeLog = async (userId, action, details) => {
  const sanitized = { ...details };
  SENSITIVE_KEYS.forEach(key => { if (sanitized[key]) sanitized[key] = '********'; });
  
  await db.insert(auditLogs).values({
    userId,
    action,
    details: sanitized
  });
};