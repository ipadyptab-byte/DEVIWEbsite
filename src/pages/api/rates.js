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

    let rows = await sql`
      SELECT gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale
      FROM gold_rates
      WHERE is_active = true
      ORDER BY created_date DESC
      LIMIT 1
    `;

    // If no active rates, bootstrap by fetching external source, store, and return
    if (!rows.length) {
      const apiUrl = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';
      const resp = await fetch(apiUrl, { cache: 'no-store' });
      if (!resp.ok) {
        return res.status(404).json({ error: 'No rates found' });
      }

      const raw = await resp.text();
      const cleaned = raw.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (e) {
        return res.status(404).json({ error: 'No rates found' });
      }

      const gold_24k_sale = Number(data['24K Gold']) || 0;
      const gold_22k_sale = Number(data['22K Gold']) || 0;
      const gold_18k_sale = Number(data['18K Gold']) || 0;
      const silver_per_gram = data?.Silver ? Number(data.Silver) / 10 : 0;
      const silver_per_kg_sale = silver_per_gram * 1000;

      await sql`UPDATE gold_rates SET is_active = false`;
      await sql`
        INSERT INTO gold_rates (
          gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale,
          is_active, source
        ) VALUES (
          ${gold_24k_sale}, ${gold_22k_sale}, ${gold_18k_sale}, ${silver_per_kg_sale},
          true, 'businessmantra_api'
        )
      `;

      rows = await sql`
        SELECT gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale
        FROM gold_rates
        WHERE is_active = true
        ORDER BY created_date DESC
        LIMIT 1
      `;
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
