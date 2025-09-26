const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  const response = {
    ok: true,
    database: 'unknown',
    version: null
  };

  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`SELECT version() AS version`;
      response.database = 'neon-postgresql';
      response.version = rows[0]?.version || null;
    } else {
      response.database = 'no DATABASE_URL configured';
    }
    return res.status(200).json(response);
  } catch (err) {
    console.error('API /api/health error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
