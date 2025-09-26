// Vercel Serverless Function: /api/rates
// Handles GET (read current rates) and PUT (update rates)

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

    if (req.method === 'GET') {
      const rows = await sql`SELECT id, vedhani, ornaments22k, ornaments18k, silver, updated_at FROM rates WHERE id = ${DOCUMENT_ID}`;
      if (rows.length === 0) {
        // seed empty row
        await sql`INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver) VALUES (${DOCUMENT_ID}, '', '', '', '')`;
        return res.status(200).json({
          vedhani: '',
          ornaments22K: '',
          ornaments18K: '',
          silver: '',
          updatedAt: null
        });
      }
      const r = rows[0];
      return res.status(200).json({
        vedhani: r.vedhani || '',
        ornaments22K: r.ornaments22k || '',
        ornaments18K: r.ornaments18k || '',
        silver: r.silver || '',
        updatedAt: r.updated_at || null
      });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const vedhani = body.vedhani ?? '';
      const ornaments22K = body.ornaments22K ?? '';
      const ornaments18K = body.ornaments18K ?? '';
      const silver = body.silver ?? '';

      await sql`
        INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
        VALUES (${DOCUMENT_ID}, ${vedhani}, ${ornaments22K}, ${ornaments18K}, ${silver})
        ON CONFLICT (id) DO UPDATE SET
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
    console.error('rates handler error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};