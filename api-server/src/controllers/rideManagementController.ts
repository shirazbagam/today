// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { db } from '../db';
import { rides, ride_bids } from '../db/schema';
import { eq } from 'drizzle-orm';

export const acceptBid = async (req, res) => {
  const { rideId, bidId, riderId } = req.body;
  try {
    await db.transaction(async (tx) => {
      // 1. Update Ride with Rider and Final Fare
      const [bid] = await tx.select().from(ride_bids).where(eq(ride_bids.id, bidId));
      await tx.update(rides).set({
        riderId: riderId,
        status: 'accepted'
      }).where(eq(rides.id, rideId));

      // 2. Update Bid Status
      await tx.update(ride_bids).set({ status: 'accepted' }).where(eq(ride_bids.id, bidId));
      await tx.update(ride_bids).set({ status: 'rejected' }).where(eq(ride_bids.id, sql`id != ${bidId} AND ride_id = ${rideId}`));
    });
    res.json({ success: true, message: "Ride assigned to rider" });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
