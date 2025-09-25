// Vercel Serverless Function: /api/rates
// Matches the actual schema used elsewhere in the project (gold_rates table).

const { neon } = require("@neondatabase/serverless");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  const sql = neon(process.env.DATABASE_URL);

  let payload = {
    gold_24k_sale: null,
    gold_22k_sale: null,
    gold_18k_sale: null,
    silver_per_kg_sale: null,
    source: "local_server",
  };

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
    } else {
      // Fallback to external feed if DB is empty
      try {
        const apiUrl = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
        const resp = await fetch(apiUrl, { cache: "no-store" });
        if (resp.ok) {
          const raw = await resp.text();
          const cleaned = raw
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "");
          const data = JSON.parse(cleaned);

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
        }
      } catch (_) {
        // keep default stub
      }
    }
  } catch (error) {
    console.error("api/rates error:", error);
    payload.source = "error";
  }

  res.status(200).json(payload);
};