import React, { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import borderLine from "../../images/border_line.png";
import "./CurrentRates.css";

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });

  const fetchAndStoreRates = async () => {
    try {
      // Delegate fetch + store to serverless function
      const resp = await fetch("/api/rates-fetch", { method: "POST" });
      if (!resp.ok) throw new Error(`Server responded ${resp.status}`);
      const newRates = await resp.json();
      setRates(newRates);
    } catch (err) {
      console.error("❌ Failed to fetch/store rates via server:", err);

      // Fallback: read last stored rates
      try {
        const r = await fetch("/api/rates");
        if (r.ok) {
          const data = await r.json();
          setRates({
            vedhani: data.vedhani || "",
            ornaments22K: data.ornaments22K || "",
            ornaments18K: data.ornaments18K || "",
            silver: data.silver || "",
          });
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch error:", fallbackErr);
      }
    }
  };

  useEffect(() => {
    fetchAndStoreRates();

    // Refresh every 30s
    const interval = setInterval(fetchAndStoreRates, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>
        <ul>
          <li className="rates">
            Vedhani <span>₹{rates.vedhani || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            22KT <span>₹{rates.ornaments22K || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            18KT <span>₹{rates.ornaments18K || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            Silver <span>₹{rates.silver || "N/A"}/g</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
