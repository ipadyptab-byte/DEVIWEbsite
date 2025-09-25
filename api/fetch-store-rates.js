import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to fetch and store latest rates.' });
  }

  try {
    // Fetch from external source
    const apiUrl = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream API error: ${response.status}` });
    }

    const raw = await response.text();
    const cleaned = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(502).json({
        error: 'Invalid JSON from upstream',
        details: parseErr.message,
        raw: raw.slice(0, 200),
      });
    }

    // Map external feed to DB schema
    const gold_24k_sale = Number(data['24K Gold']) || 0;
    const gold_22k_sale = Number(data['22K Gold']) || 0;
    const gold_18k_sale = Number(data['18K Gold']) || 0;
    const silver_per_gram = data?.Silver ? Number(data.Silver) / 10 : 0;
    const silver_per_kg_sale = silver_per_gram * 1000;

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
        source TEXT DEFAULT 'external_sync'
      )
    `;

    await sql`UPDATE gold_rates SET is_active = false`;

    const inserted = await sql`
      INSERT INTO gold_rates (
        gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale, is_active, source
      ) VALUES (
        ${gold_24k_sale}, ${gold_22k_sale}, ${gold_18k_sale}, ${silver_per_kg_sale}, true, 'external_sync'
      ) RETURNING *
    `;

    return res.status(200).json({
      success: true,
      message: 'Rates fetched from external API and stored in PostgreSQL.',
      data: inserted[0],
    });
  } catch (error) {
    console.error('fetch-store-rates api error:', error);
    return res.status(500).json({ error: 'Failed to fetch and store rates', details: error.message });
  }
}