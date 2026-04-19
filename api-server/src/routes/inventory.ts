import { db } from "../db/index";
import { products, stockLogs } from "../db/schema";
import { eq } from "drizzle-orm";

export const updateStock = async (req: any, res: any) => {
  const { productId, amount, reason } = req.body;
  try {
    await db.transaction(async (tx) => {
      await tx.update(products).set({ stock: amount }).where(eq(products.id, productId));
      await tx.insert(stockLogs).values({ productId, changeAmount: amount, reason });
    });
    res.json({ success: true, message: "Stock Updated Successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
