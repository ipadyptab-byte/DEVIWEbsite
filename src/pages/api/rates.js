export default async function handler(req, res) {
  try {
    // Fetch latest rates from Business Mantra API
    const apiUrl = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
    const response = await fetch(apiUrl, { cache: "no-store" });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream API error: ${response.status}` });
    }

    const data = await response.json();

    // The API returns keys like: {"24K Gold":113000,"22K Gold":103960,"18K Gold":93790,"Silver":1340}
    // Map to our frontend expectations. Silver appears in many feeds as per 10g;
    // the UI shows Silver per gram, so convert by dividing by 10 (adjust here if feed spec changes).
    const mapped = {
      gold_24k_sale: Number(data["24K Gold"]) || null,
      gold_22k_sale: Number(data["22K Gold"]) || null,
      gold_18k_sale: Number(data["18K Gold"]) || null,
      // convert to per gram for UI: if the source already provides per gram, change divisor to 1
      silver_per_kg_sale: data?.Silver ? Number(data.Silver) * 10 : null, // maintain legacy field name but keep value as per kg equivalent
      silver_per_gram: data?.Silver ? Number(data.Silver) / 10 : null,
    };

    // Respond in the same shape CurrentRates expects
    return res.status(200).json({
      gold_24k_sale: mapped.gold_24k_sale,
      gold_22k_sale: mapped.gold_22k_sale,
      gold_18k_sale: mapped.gold_18k_sale,
      // CurrentRates.js divides silver_per_kg_sale by 1000 to display per gram.
      // Provide a compatible value by sending grams->kg conversion here.
      silver_per_kg_sale: mapped.silver_per_gram != null ? mapped.silver_per_gram * 1000 : null,
      source: "businessmantra_api",
    });
  } catch (error) {
    console.error("Failed to fetch external rates:", error);
    res.status(500).json({ error: "Failed to fetch rates from external source" });
  }
}
