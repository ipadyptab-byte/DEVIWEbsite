// Vercel Serverless Function: /api/rates
// Uses the actual table found in the repo: gold_rates
// Note: @neondatabase/serverless is ESM-only, so we dynamically import it.

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  let payload = {
    gold_24k_sale: null,
    gold_22k_sale: null,
    gold_18k_sale: null,
    silver_per_kg_sale: null,
    source: "local_server",
  };

  const dbUrl = process.env.DATABASE_URL;

  // Try DB first (if configured)
  if (dbUrl) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);

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

      if (rows.length) {
        const row = rows[0];
        payload = {
          gold_24k_sale: row.gold_24k_sale ?? null,
          gold_22k_sale: row.gold_22k_sale ?? null,
          gold_18k_sale: row.gold_18k_sale ?? null,
          silver_per_kg_sale: row.silver_per_kg_sale ?? null,
          source: "vercel_postgresql",
        };
        return res.status(200).end(JSON.stringify(payload));
      }
      // If DB reachable but empty, fall through to external
    } catch (err) {
      console.error("DB access failed in /api/rates:", err);
      // Fall through to external feed
    }
  }

  // External fallback (also used when DATABASE_URL missing)
  try {
    const apiUrl = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
    const resp = await fetch(apiUrl, { cache: "no-store" });
    if (!resp.ok) {
      // Keep stub payload but mark error
      payload.source = "error";
      return res.status(200).end(JSON.stringify(payload));
    }

    const raw = await resp.text();
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      payload.source = "error";
      return res.status(200).end(JSON.stringify(payload));
    }

    const gold_24k_sale = Number(data["24K Gold"]) || null;
    const gold_22k_sale = Number(data["22K Gold"]) || null;
    const gold_18k_sale = Number(data["18K Gold"]) || null;
    const silver_per_gram = data?.Silver ? Number(data.Silver) / 10 : null;

    payload = {
      gold_24k_sale,
      gold_22k_sale,
      gold_18k_sale,
      silver_per_kg_sale: silver_per_gram != null ? silver_per_gram * 1000 : null,
      source: "businessmantra_api_fallback",
    };

    return res.status(200).end(JSON.stringify(payload));
  } catch (fallbackErr) {
    console.error("External fallback failed in /api/rates:", fallbackErr);
    payload.source = "error";
    return res.status(200).end(JSON.stringify(payload));
  }
};
