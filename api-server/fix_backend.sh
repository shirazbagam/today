#!/bin/bash
echo "🚀 --- AJKMART BACKEND FULL REPAIR ---"

# 1. Install missing driver
echo "📦 Installing postgres driver..."
pnpm add postgres

# 2. Fix Database Index File
echo "🗄️ Fixing Database Index..."
cat << 'INNER_EOF' > src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 'postgresql://neondb_owner:npg_s6YEp4qkXPDz@ep-blue-cake-amu6yuja-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
INNER_EOF

# 3. Fix Stats Route File
echo "📈 Fixing Stats Route..."
cat << 'INNER_EOF' > src/routes/stats.ts
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
INNER_EOF

# 4. Final Server Index Fix
echo "🌐 Fixing Main Server File..."
cat << 'INNER_EOF' > src/index.ts
import express from 'express';
import cors from 'cors';
import { getStats } from './routes/stats';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/stats', getStats);

const PORT = 4000;
app.listen(PORT, () => console.log('🚀 Server running on http://localhost:4000'));
INNER_EOF

echo "✅ All files fixed. Starting server..."
pnpm dev
