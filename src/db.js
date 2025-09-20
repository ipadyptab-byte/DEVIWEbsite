import { Client } from "@neondatabase/serverless";

let client;

if (!client) {
  client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
}

export default client;
