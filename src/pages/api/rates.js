import client from "../../lib/db";

export default async function handler(req, res) {
  try {
    await client.connect();

    // Get the most recent active rates from Postgres
    const result = await client.query(
      "SELECT gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale FROM gold_rates WHERE is_active = true ORDER BY created_date DESC LIMIT 1"
    );

    await client.end();

    if (!result.rows.length) {
      return res.status(404).json({ error: "No rates found" });
    }

    const row = result.rows[0];

    return res.status(200).json({
      gold_24k_sale: row.gold_24k_sale,
      gold_22k_sale: row.gold_22k_sale,
      gold_18k_sale: row.gold_18k_sale,
      silver_per_kg_sale: row.silver_per_kg_sale,
      source: "vercel_postgresql",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
}
