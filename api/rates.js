import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Ensure table exists (first-time deployments)
    await sql`
      CREATE TABLE IF NOT EXISTS gold_rates (
        id SERIAL PRIMARY KEY,
        gold_24k_sale REAL NOT NULL,
        gold_24k_purchase REAL,
        gold_22k_sale REAL NOT NULL,
        gold_22k_purchase REAL,
        gold_18k_sale REAL NOT NULL,
        gold_18k_purchase REAL,
        silver_per_kg_sale REAL NOT NULL,
        silver_per_kg_purchase REAL,
        is_active BOOLEAN DEFAULT true,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'local_sync'
      )
    `;

    const rows = await sql`
      SELECT gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale
      FROM gold_rates
      WHERE is_active = true
      ORDER BY created_date DESC
      LIMIT 1
    `;

    if (!rows.length) {
      return res.status(404).json({ error: 'No rates found' });
    }

    const row = rows[0];

    return res.status(200).json({
      gold_24k_sale: row.gold_24k_sale,
      gold_22k_sale: row.gold_22k_sale,
      gold_18k_sale: row.gold_18k_sale,
      silver_per_kg_sale: row.silver_per_kg_sale,
      source: 'vercel_postgresql',
    });
  } catch (error) {
    console.error('rates api error:', error);
    return res.status(500).json({ error: 'Failed to fetch rates' });
  }
}