export default async function handler(req, res) {
  try {
    const apiUrl = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
    const response = await fetch(apiUrl, { cache: "no-store" });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream API error: ${response.status}` });
    }

    // Read raw text then try to parse JSON safely (handles cases where upstream
    // might wrap the payload in code fences or send stray characters)
    const raw = await response.text();
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      // Return a diagnostic error to the client; front-end will show a graceful message
      return res.status(502).json({
        error: "Invalid JSON from upstream",
        details: parseErr.message,
        raw: raw.slice(0, 200),
      });
    }

    const mapped = {
      gold_24k_sale: Number(data["24K Gold"]) || null,
      gold_22k_sale: Number(data["22K Gold"]) || null,
      gold_18k_sale: Number(data["18K Gold"]) || null,
      // Silver appears to be per 10g from external feed; convert to per gram
      silver_per_gram: data?.Silver ? Number(data.Silver) / 10 : null,
    };

    // CurrentRates.js divides silver_per_kg_sale by 1000 to show per gram.
    // Provide a kg-equivalent derived from per-gram for compatibility.
    return res.status(200).json({
      gold_24k_sale: mapped.gold_24k_sale,
      gold_22k_sale: mapped.gold_22k_sale,
      gold_18k_sale: mapped.gold_18k_sale,
      silver_per_kg_sale: mapped.silver_per_gram != null ? mapped.silver_per_gram * 1000 : null,
      source: "businessmantra_api",
    });
  } catch (error) {
    console.error("Failed to fetch external rates:", error);
    res.status(500).json({ error: "Failed to fetch rates from external source" });
  }
}
