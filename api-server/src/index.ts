import express from 'express';
import cors from 'cors';
import { db } from "./db/index";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

// --- Original Frontend Compatibility Routes ---
// Ye routes purane frontend ki requests ko hamare naye Neon DB se connect karenge
const authHandler = async (req, res) => {
  const { email } = req.body;
  try {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (user && user.role === 'admin') {
      return res.json({ success: true, token: "original-style-token", user });
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Frontend shayad inme se koi ek use kar raha ho:
app.post('/api/admin/login', authHandler);
app.post('/api/login', authHandler);
app.post('/admin/auth', authHandler);

// Dashboard data link
app.get('/api/stats', async (req, res) => {
  const u = await db.select().from(schema.users);
  const p = await db.select().from(schema.products);
  res.json({ userCount: u.length, productCount: p.length, totalCash: 5000 });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 Universal Backend Linked to Original Frontend'));
