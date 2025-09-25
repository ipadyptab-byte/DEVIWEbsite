import React, { useState } from "react";
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

      // Post to serverless API to store rates in PostgreSQL
      const resp = await fetch("/api/sync-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gold_24k_sale: Number(rates.vedhani),
          gold_24k_purchase: Number(rates.vedhani), // mirror sale if purchase not provided
          gold_22k_sale: Number(rates.ornaments22K),
          gold_22k_purchase: Number(rates.ornaments22K),
          gold_18k_sale: Number(rates.ornaments18K),
          gold_18k_purchase: Number(rates.ornaments18K),
          silver_per_kg_sale: Number(rates.silver),
          silver_per_kg_purchase: Number(rates.silver),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${resp.status}`);
      }

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
