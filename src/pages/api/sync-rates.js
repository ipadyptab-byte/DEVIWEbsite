import { neon } from '@neondatabase/serverless';

// PostgreSQL connection using Neon - using the pooled connection string
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Receive rates from local system and store in Vercel PostgreSQL
      const localRates = req.body;
      
      console.log('📥 Received rates from local system:', localRates);
      
      // Create the rates table if it doesn't exist
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

      // Deactivate all existing rates
      await sql`UPDATE gold_rates SET is_active = false`;
      
      // Insert new rates
      const result = await sql`
        INSERT INTO gold_rates (
          gold_24k_sale, gold_24k_purchase, gold_22k_sale, gold_22k_purchase,
          gold_18k_sale, gold_18k_purchase, silver_per_kg_sale, silver_per_kg_purchase,
          is_active, source
        ) VALUES (
          ${localRates.gold_24k_sale}, ${localRates.gold_24k_purchase},
          ${localRates.gold_22k_sale}, ${localRates.gold_22k_purchase},
          ${localRates.gold_18k_sale}, ${localRates.gold_18k_purchase},
          ${localRates.silver_per_kg_sale}, ${localRates.silver_per_kg_purchase},
          true, 'local_sync'
        ) RETURNING *
      `;
      
      console.log('✅ Rates synced to Vercel PostgreSQL:', result[0]);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Rates synced successfully to Vercel PostgreSQL',
        data: result[0]
      });

    } else if (req.method === 'GET') {
      // Get current rates from Vercel PostgreSQL
      try {
        // Create table if it doesn't exist (for first-time setup)
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

        // Get current active rates
        const rates = await sql`
          SELECT * FROM gold_rates 
          WHERE is_active = true 
          ORDER BY created_date DESC 
          LIMIT 1
        `;
        
        if (rates.length === 0) {
          console.log('⚠️ No rates found in Vercel PostgreSQL');
          return res.status(404).json({ 
            error: 'No rates found',
            message: 'No rates available in PostgreSQL database'
          });
        }
        
        console.log('✅ Returning rates from Vercel PostgreSQL');
        return res.status(200).json({
          ...rates[0],
          source: 'vercel_postgresql'
        });
        
      } catch (dbError) {
        console.error('❌ Database query error:', dbError);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
