export default async function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      },
      note: 'If you can see this JSON, serverless functions are reachable on this domain.',
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ ok: false, error: 'health check failed', message: err?.message });
  }
}