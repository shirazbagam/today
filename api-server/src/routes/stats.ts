import { db } from "../db/index";
import { users, products } from "../db/schema";

export const getStats = async (req, res) => {
  try {
    const uCount = await db.select().from(users);
    const pCount = await db.select().from(products);
    res.json({
      success: true,
      data: {
        userCount: uCount.length,
        productCount: pCount.length,
        totalCash: 5000
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
