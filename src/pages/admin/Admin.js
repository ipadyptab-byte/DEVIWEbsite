import React, { useState } from "react";
import './Admin.css';

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
    setRates((prevRates) => ({
      ...prevRates,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });

      if (!res.ok) throw new Error(`Failed to update rates (${res.status})`);

      alert("Rates updated successfully!");
      setRates({
        vedhani: "",
        ornaments22K: "",
        ornaments18K: "",
        silver: "",
      });
    } catch (error) {
      console.error("Error updating rates: ", error);
      alert("Failed to update rates.");
    }
  };

  const fetchAndSaveRates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rates-fetch", { method: "POST" });
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      const mapped = await res.json();

      // Update UI with fetched values
      setRates(mapped);

      alert("Fetched latest rates from API and saved to database.");
    } catch (error) {
      console.error("Failed to fetch/save rates from API:", error);
      alert("Failed to fetch/save rates from API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Upload Current Rates</h2>

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={fetchAndSaveRates} disabled={loading}>
          {loading ? "Fetching..." : "Fetch from API and Save"}
        </button>
      </div>

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
        <button type="submit">Update Rates</button>
      </form>
    </div>
  );
};

export default Admin;
