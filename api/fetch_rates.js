/**
 * Vercel Serverless Function to fetch rates from external API and save to Neon (PostgreSQL).
 * Endpoint:
 *  - POST /api/fetch_rates     -> fetches from configured URL and upserts a single row in `rates`
 *  - GET  /api/fetch_rates     -> same as POST (convenience)
 *
 * Env required: DATABASE_URL
 *
 * External source: https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php
 * Example payload:
 *   { "24K Gold": 113300, "22K Gold": 104240, "18K Gold": 94040, "Silver": 1390 }
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
 * Single fixed row id: 'GF8lmn4pjyeuqPzA0xDE'
 */

const { neon } = require('@neondatabase/serverless');

const FIXED_ID = 'GF8lmn4pjyeuqPzA0xDE';
const SOURCE_URL = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';

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

  const existing = await sql`SELECT id FROM rates WHERE id = ${FIXED_ID}`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
      VALUES (${FIXED_ID}, '', '', '', '')
    `;
  }
}

async function fetchSource() {
  const resp = await fetch(SOURCE_URL, {
    headers: { 'Accept': 'application/json' }
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch source: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  return data;
}

module.exports = async function handler(req, res) {
  try {
    const sql = getClient();
    await ensureSchema(sql);

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const data = await fetchSource();
    // Map external fields to our schema. Store as text.
    const vedhani = String(data['24K Gold'] ?? '');
    const ornaments22K = String(data['22K Gold'] ?? '');
    const ornaments18K = String(data['18K Gold'] ?? '');
    const silver = String(data['Silver'] ?? '');

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

    return res.status(200).json({
      ok: true,
      source_url: SOURCE_URL,
      saved: {
        vedhani,
        ornaments22K,
        ornaments18K,
        silver
      }
    });
  } catch (err) {
    console.error('API /api/fetch_rates error', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
