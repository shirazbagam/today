// @ts-nocheck
// @ts-nocheck
import { db } from '../db';
import { pharmacy_orders, van_bookings, parcel_bookings, school_routes } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const createPharmacyOrder = async (req, res) => {
  const { items, prescriptionUrl, total } = req.body;
  try {
    const [order] = await db.insert(pharmacy_orders).values({
      userId: req.user.userId,
      prescriptionUrl,
      totalAmount: total.toString(),
      status: 'pending'
    }).returning();
    res.json({ success: true, orderId: order.id });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const bookVan = async (req, res) => {
  const { routeId, seats, date } = req.body;
  try {
    const [booking] = await db.insert(van_bookings).values({
      userId: req.user.userId,
      routeId,
      seatsBooked: seats,
      bookingDate: date,
      status: 'confirmed'
    }).returning();
    res.json({ success: true, bookingId: booking.id });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const getModuleData = (tableName) => async (req, res) => {
  try {
    const data = await db.execute(sql.raw(`SELECT * FROM ${tableName} LIMIT 50`));
    res.json({ success: true, data: data.rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
