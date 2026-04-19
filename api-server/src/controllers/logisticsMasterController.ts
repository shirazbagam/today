// @ts-nocheck
import { db } from '../db';
import { rider_profiles, rides } from '../db/schema';
import { eq } from 'drizzle-orm';

export const updateRiderLocation = async (req, res) => {
  const { lat, lng } = req.body;
  await db.update(rider_profiles).set({ currentLocation: `${lat},${lng}` }).where(eq(rider_profiles.userId, req.user.userId));
  res.json({ success: true, message: "Location Live!" });
};
