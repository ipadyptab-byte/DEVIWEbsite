// Vercel Serverless Function: /api/rates
// Returns latest rates in a consistent JSON shape so the frontend never breaks.

const { Client } = require("@neondatabase/serverless");

/**
 * Try to fetch rates from Neon Postgres if NEON_DATABASE_URL is configured.
 * Fallback to a safe stub with nulls so the UI can show "Loading..." instead of crashing.
 */
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  let payload = {
    gold_24k_sale: null,
    gold_22k_sale: null,
    gold_18k_sale: null,
    silver_per_kg_sale: null,
    source: "local_server",
  };

  const connStr = process.env.NEON_DATABASE_URL;

  if (connStr) {
    const client = new Client({ connectionString: connStr });
    try {
      await client.connect();

      // Attempt to read the latest row from a plausible table.
      // Adjust table/column names if your schema differs.
      const result = await client.query(
        `
        SELECT 
          gold_24k_sale,
          gold_22k_sale,
          gold_18k_sale,
          silver_per_kg_sale,
          updated_at
        FROM current_rates
        ORDER BY updated_at DESC
        LIMIT 1
        `
      );

      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        payload = {
          gold_24k_sale: row.gold_24k_sale ?? null,
          gold_22k_sale: row.gold_22k_sale ?? null,
          gold_18k_sale: row.gold_18k_sale ?? null,
          silver_per_kg_sale: row.silver_per_kg_sale ?? null,
          source: "vercel_postgresql",
        };
      } else {
        payload.source = "local_sync"; // DB reachable but no data
      }
    } catch (err) {
      console.error("Error querying Neon:", err);
      // Keep payload as safe stub
      payload.source = "error";
    } finally {
      try {
        await client.end();
      } catch (_) {
        // ignore
      }
    }
  } else {
    // No DB configured; keep stub
    payload.source = "local_server";
  }

  res.status(200).json(payload);
};
