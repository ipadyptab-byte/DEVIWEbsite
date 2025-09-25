// Vercel Serverless Function: /api/sync-rates
// GET: returns latest active row from gold_rates
// POST: upserts a new active row with provided body values

module.exports = async (req, res) => {
  // CORS (optional if only called same-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).end(JSON.stringify({ error: "DATABASE_URL not configured" }));
    }

    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS gold_rates (
        id SERIAL PRIMARY KEY,
        gold_24k_sale REAL NOT NULL,
        gold_24k_purchase REAL NOT NULL,
        gold_22k_sale REAL NOT NULL,
        gold_22k_purchase REAL NOT NULL,
        gold_18k_sale REAL NOT NULL,
        gold_18k_purchase REAL NOT NULL,
        silver_per_kg_sale REAL NOT NULL,
        silver_per_kg_purchase REAL NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'local_sync'
      )
    `;

    if (req.method === "POST") {
      const localRates = req.body || {};

      await sql`UPDATE gold_rates SET is_active = false`;

      const result = await sql`
        INSERT INTO gold_rates (
          gold_24k_sale, gold_24k_purchase, gold_22k_sale, gold_22k_purchase,
          gold_18k_sale, gold_18k_purchase, silver_per_kg_sale, silver_per_kg_purchase,
          is_active, source
        ) VALUES (
          ${Number(localRates.gold_24k_sale)}, ${Number(localRates.gold_24k_purchase)},
          ${Number(localRates.gold_22k_sale)}, ${Number(localRates.gold_22k_purchase)},
          ${Number(localRates.gold_18k_sale)}, ${Number(localRates.gold_18k_purchase)},
          ${Number(localRates.silver_per_kg_sale)}, ${Number(localRates.silver_per_kg_purchase)},
          true, 'local_sync'
        ) RETURNING *
      `;

      return res
        .status(200)
        .end(
          JSON.stringify({
            success: true,
            message: "Rates synced successfully to Vercel PostgreSQL",
            data: result[0],
          })
        );
    }

    if (req.method === "GET") {
      const rates = await sql`
        SELECT * FROM gold_rates
        WHERE is_active = true
        ORDER BY created_date DESC
        LIMIT 1
      `;
      if (!rates.length) {
        return res.status(404).end(JSON.stringify({ error: "No rates found" }));
      }
      return res.status(200).end(JSON.stringify({ ...rates[0], source: "vercel_postgresql" }));
    }

    return res.status(405).end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error) {
    console.error("sync-rates api error:", error);
    return res.status(500).end(JSON.stringify({ error: "Internal server error", message: error.message }));
  }
};
