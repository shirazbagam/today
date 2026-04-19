// @ts-nocheck
import { db } from '../db';
import { sql } from 'drizzle-orm';

export const getTableData = async (req, res) => {
  const { table } = req.params;
  try {
    const data = await db.execute(sql.raw(`SELECT * FROM ${table} LIMIT 100`));
    res.json({ success: true, data: data.rows });
  } catch (e) { res.status(400).json({ success: false, message: "Table Error" }); }
};
