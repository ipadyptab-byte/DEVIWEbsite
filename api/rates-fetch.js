// Vercel Serverless Function: /api/rates-fetch
// Fetches from external API, maps values, stores in Neon, returns current rates.

module.exports = async (req, res) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    // Ensure table exists
    await sql`CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      vedhani TEXT,
      ornaments22k TEXT,
      ornaments18k TEXT,
      silver TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`;

    const DOCUMENT_ID = 'GF8lmn4pjyeuqPzA0xDE';
    const API_URL = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';

    // Fetch and clean up potential code fences
    const resp = await fetch(API_URL);
    const raw = await resp.text();
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      return res.status(502).json({ error: 'Failed to parse API response' });
    }

    const vedhani = Number(data['24K Gold']) || 0;
    const ornaments22K = Number(data['22K Gold']) || 0;
    const ornaments18K = Number(data['18K Gold']) || 0;

    // Original code used "Silver per gram = Silver/10" (if API returns per 10g)
    // Keep parity with the existing UI expectation
    const silver_per_gram = data?.Silver ? Number(data.Silver) / 10 : 0;

    const newRates = {
      vedhani: vedhani.toString(),
      ornaments22K: ornaments22K.toString(),
      ornaments18K: ornaments18K.toString(),
      silver: silver_per_gram.toString()
    };

    await sql`
      INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
      VALUES (${DOCUMENT_ID}, ${newRates.vedhani}, ${newRates.ornaments22K}, ${newRates.ornaments18K}, ${newRates.silver})
      ON CONFLICT (id) DO UPDATE SET
        vedhani = EXCLUDED.vedhani,
        ornaments22k = EXCLUDED.ornaments22k,
        ornaments18k = EXCLUDED.ornaments18k,
        silver = EXCLUDED.silver,
        updated_at = NOW()
    `;

    return res.status(200).json(newRates);
  } catch (err) {
    console.error('rates-fetch handler error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};