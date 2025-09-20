import { db } from "@/lib/db";
import { goldRates } from "@/lib/schema";
import { pushRatesToVercel } from "@/lib/syncToVercel";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { gold_24k_sale, silver_24k_sale } = req.body;

      // 1. Save to Render DB
      const [newRate] = await db.insert(goldRates).values({
        gold_24k_sale,
        silver_24k_sale,
      }).returning("*");

      // 2. Push to Vercel DB
      await pushRatesToVercel({
        gold_24k_sale: newRate.gold_24k_sale,
        silver_24k_sale: newRate.silver_24k_sale,
      });

      return res.status(200).json(newRate);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update rates" });
    }
  }

  res.status(405).end(); // Method Not Allowed
}
 
