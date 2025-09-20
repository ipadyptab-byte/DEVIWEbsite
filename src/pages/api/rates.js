import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    host: process.env.103.159.153.24,      // 103.159.153.24
    port: 5432,
    user: process.env.postgres,
    password: process.env.mangesh1981,
    database: process.env.ratedisplay,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT vedhani, ornaments_22k, ornaments_18k, silver
      FROM gold_rates
      ORDER BY id DESC
      LIMIT 1;
    `);

    await client.end();

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404).json({ error: "No rates found" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
}
