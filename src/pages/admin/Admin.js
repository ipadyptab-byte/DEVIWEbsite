import React, { useState } from "react";
import client from "../../lib/db";
import "./Admin.css";

const Admin = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRates((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      rates.vedhani <= 0 ||
      rates.ornaments22K <= 0 ||
      rates.ornaments18K <= 0 ||
      rates.silver <= 0
    ) {
      return alert("Enter valid positive numbers for all rates.");
    }

    try {
      setLoading(true);
      await client.connect();

      await client.query(
        `INSERT INTO gold_rates (gold_24k_sale, gold_22k_sale, gold_18k_sale, silver_per_kg_sale)
         VALUES ($1, $2, $3, $4)`,
        [
          Number(rates.vedhani),
          Number(rates.ornaments22K),
          Number(rates.ornaments18K),
          Number(rates.silver),
        ]
      );

      await client.end();

      alert("✅ Rates updated successfully!");
      setRates({ vedhani: "", ornaments22K: "", ornaments18K: "", silver: "" });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Upload Current Rates</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vedhani (10 grams):</label>
          <input
            type="number"
            name="vedhani"
            value={rates.vedhani}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ornaments 22K (10 grams):</label>
          <input
            type="number"
            name="ornaments22K"
            value={rates.ornaments22K}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ornaments 18K (10 grams):</label>
          <input
            type="number"
            name="ornaments18K"
            value={rates.ornaments18K}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Silver (per KG):</label>
          <input
            type="number"
            name="silver"
            value={rates.silver}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Rates"}
        </button>
      </form>
    </div>
  );
};

export default Admin;
