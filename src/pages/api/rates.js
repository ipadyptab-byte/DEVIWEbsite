import { Client } from "pg";

// API route: /api/rates
export default async function handler(req, res) {
  // Create a new PostgreSQL client using environment variables
  const client = new Client({
    host: process.env.DB_HOST,           // e.g., 103.159.153.24
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,           // e.g., postgres
    password: process.env.DB_PASSWORD,   // e.g., mangesh1981
    database: process.env.DB_NAME,       // e.g., ratedisplay
  });

  try {
    // Connect to the database
    await client.connect();

    // Fetch the latest gold and silver rates
    const result = await client.query(`
      SELECT vedhani, ornaments_22k, ornaments_18k, silver
      FROM gold_rates
      ORDER BY id DESC
      LIMIT 1;
    `);

    if (result.rows.length > 0) {
      // Send the latest rates as JSON
      res.status(200).json(result.rows[0]);
    } else {
      // No data found
      res.status(404).json({ error: "No rates found" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  } finally {
    // Ensure the client is closed in all cases
    await client.end();
  }
}
