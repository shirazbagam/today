import { db } from "../db";
import { walletTransactions, orderRefunds, orders } from "../db/schema";
import { eq } from "drizzle-orm";

export const processOrderRefund = async (orderId: string) => {
  return await db.transaction(async (tx) => {
    // 1. Order details uthao (amount aur user ka pata chalao)
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    
    if (!order || order.status === 'refunded') return;

    // 2. Wallet Transaction create karo (Credit)
    const [trans] = await tx.insert(walletTransactions).values({
      userId: order.customerId,
      amount: order.totalAmount,
      type: 'credit',
      status: 'completed'
    }).returning();

    // 3. Refund log banao
    await tx.insert(orderRefunds).values({
      orderId: order.id,
      transactionId: trans.id,
      reason: 'Customer Cancellation'
    });

    // 4. Order status update karo
    await tx.update(orders).set({ status: 'refunded' }).where(eq(orders.id, orderId));
  });
};