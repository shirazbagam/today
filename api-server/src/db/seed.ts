import { db } from "./index";
import { users, products, walletTransactions } from "./schema";

async function seed() {
  const [customer] = await db.insert(users).values({
    name: 'Ali Khan',
    email: 'ali@ajky.com',
    role: 'customer'
  }).returning();

  await db.insert(products).values([
    { name: 'Apple iPhone 15', stock: 10, price: '250000' },
    { name: 'Dell Latitude Laptop', stock: 5, price: '120000' }
  ]);

  await db.insert(walletTransactions).values({
    userId: customer.id,
    amount: '5000',
    type: 'credit',
    status: 'completed'
  });

  console.log("data seeded successfully");
}

seed().catch(console.error);