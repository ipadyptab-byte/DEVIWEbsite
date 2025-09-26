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
      // 1) Fetch from external API
      const apiUrl =
        "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
      const resp = await fetch(apiUrl, { cache: "no-store" });

      const raw = await resp.text();
      const cleaned = raw
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "");

      const data = JSON.parse(cleaned);

      // 2) Map values
      const vedhani = Number(data["24K Gold"]) || 0;
      const ornaments22K = Number(data["22K Gold"]) || 0;
      const ornaments18K = Number(data["18K Gold"]) || 0;
      const silver_per_gram = data?.Silver ? Number(data.Silver) / 10 : 0;

      const newRates = {
        vedhani: vedhani.toString(),
        ornaments22K: ornaments22K.toString(),
        ornaments18K: ornaments18K.toString(),
        silver: silver_per_gram.toString(), // per gram
      };

      // 3) Save into Neon via our API
      await fetch("/api/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRates),
      });

      // 4) Update state
      setRates(newRates);
    } catch (err) {
      console.error("❌ Failed to fetch/store rates:", err);

      // Fallback: read last stored rates from Neon via our API
      try {
        const res = await fetch("/api/rates");
        if (res.ok) {
          const data = await res.json();
          setRates({
            vedhani: data.vedhani || "",
            ornaments22K: data.ornaments22K || "",
            ornaments18K: data.ornaments18K || "",
            silver: data.silver || "",
          });
        }
      } catch (apiErr) {
        console.error("API fallback error:", apiErr);
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
