import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/Firebase";
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
    setRates((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation
    if (
      rates.vedhani <= 0 ||
      rates.ornaments22K <= 0 ||
      rates.ornaments18K <= 0 ||
      rates.silver <= 0
    ) {
      return alert("⚠️ Please enter valid positive numbers for all rates.");
    }

    try {
      setLoading(true);

      const documentId = "GF8lmn4pjyeuqPzA0xDE"; // 🔧 Move to ENV later
      const documentRef = doc(db, "rates", documentId);

      await updateDoc(documentRef, {
        gold_24k_sale: Number(rates.vedhani),
        gold_22k_sale: Number(rates.ornaments22K),
        gold_18k_sale: Number(rates.ornaments18K),
        silver_per_kg_sale: Number(rates.silver),
        updated_at: new Date().toISOString(),
      });

      alert("✅ Rates updated successfully!");
      setRates({
        vedhani: "",
        ornaments22K: "",
        ornaments18K: "",
        silver: "",
      });
    } catch (error) {
      console.error("❌ Error updating rates: ", error);
      alert("Failed to update rates.");
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
