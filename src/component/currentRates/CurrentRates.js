import React, { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import borderLine from "../../images/border_line.png";
import "./CurrentRates.css";

const API_BASE = "http://103.159.153.24:3000";

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani24K: "NA",
    ornaments22K: "NA",
    ornaments18K: "NA",
    silver: "NA",
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/rates/current`);
        if (!response.ok) throw new Error("Failed to fetch rates");
        const apiRates = await response.json();
        setRates({
          vedhani24K: apiRates.gold_24k_sale ?? "NA",
          ornaments22K: apiRates.gold_22k_sale ?? "NA",
          ornaments18K: apiRates.gold_18k_sale ?? "NA",
          silver: apiRates.silver_per_kg_sale ?? "NA",
        });
      } catch (error) {
        console.error("Error fetching rates from API:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="iconcontainer">
      <span className="iconwrapper"><BsGraphUpArrow /></span>
      <span className="title">Current Rates</span>
      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>
        <ul>
          <li className="ratesVedhani">
            <span>{rates.vedhani}</span>
          </li>
          <li className="rates22KT">
            <span>{rates.ornaments22K}</span>
          </li>
          <li className="rates18KT">
            <span>{rates.ornaments18K}</span>
          </li>
          <li className="ratesSilver">
            <span>{rates.silver}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
