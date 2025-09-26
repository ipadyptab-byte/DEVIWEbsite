/**
 * Vercel Serverless Function for managing rates in Neon (PostgreSQL).
 * Exposes:
 *  - GET /api/rates            -> returns the single rates row
 *  - PUT /api/rates            -> upserts the rates values
 *
 * Requires env var: DATABASE_URL (Neon connection string)
 *
 * Schema (auto-created if missing):
 *   CREATE TABLE IF NOT EXISTS rates (
 *     id TEXT PRIMARY KEY,
 *     vedhani TEXT,
 *     ornaments22k TEXT,
 *     ornaments18k TEXT,
 *     silver TEXT,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 * We use a single fixed id: 'GF8lmn4pjyeuqPzA0xDE'
 */

const { neon } = require('@neondatabase/serverless');

const FIXED_ID = 'GF8lmn4pjyeuqPzA0xDE';

function getClient() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL env var is not set');
  }
  return neon(DATABASE_URL);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      vedhani TEXT,
      ornaments22k TEXT,
      ornaments18k TEXT,
      silver TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Ensure a single row exists
  const existing = await sql`SELECT id FROM rates WHERE id = ${FIXED_ID}`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
      VALUES (${FIXED_ID}, '', '', '', '')
    `;
  }
}

module.exports = async function handler(req, res) {
  try {
    const sql = getClient();
    await ensureSchema(sql);

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, vedhani, ornaments22k, ornaments18k, silver, updated_at
        FROM rates
        WHERE id = ${FIXED_ID}
        LIMIT 1
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Rates not found' });
      }
      const r = rows[0];
      return res.status(200).json({
        vedhani: r.vedhani || '',
        ornaments22K: r.ornaments22k || '',
        ornaments18K: r.ornaments18k || '',
        silver: r.silver || '',
        updated_at: r.updated_at,
      });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const {
        vedhani = '',
        ornaments22K = '',
        ornaments18K = '',
        silver = '',
      } = body;

      await sql`
        INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver, updated_at)
        VALUES (${FIXED_ID}, ${vedhani}, ${ornaments22K}, ${ornaments18K}, ${silver}, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          vedhani = EXCLUDED.vedhani,
          ornaments22k = EXCLUDED.ornaments22k,
          ornaments18k = EXCLUDED.ornaments18k,
          silver = EXCLUDED.silver,
          updated_at = NOW()
      `;

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API /api/rates error', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}