import { db } from "./db";
import { vanBookings, parcelBookings } from "./db/schema";

export const bookVan = async (data) => {
  return await db.insert(vanBookings).values(data);
};

export const createParcel = async (data) => {
  return await db.insert(parcelBookings).values(data);
};