import React, { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import "./CurrentRates.css";

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "Loading...",
    ornaments22K: "Loading...",
    ornaments18K: "Loading...",
    silver: "Loading...",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState("loading");
  const [isLoading, setIsLoading] = useState(true);

  // Normalize payload into component state
  const toState = (data, sourceLabel) => {
    return {
      vedhani: data.gold_24k_sale != null ? data.gold_24k_sale.toString() : "Loading...",
      ornaments22K: data.gold_22k_sale != null ? data.gold_22k_sale.toString() : "Loading...",
      ornaments18K: data.gold_18k_sale != null ? data.gold_18k_sale.toString() : "Loading...",
      silver:
        data.silver_per_kg_sale != null
          ? Math.round(Number(data.silver_per_kg_sale) / 1000).toString()
          : "Loading...",
    };
  };

  // Attempt to fetch JSON safely; throws if not JSON
  const fetchJsonSafe = async (url) => {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return await resp.json();
    }
    // If upstream wraps JSON in backticks, clean and parse
    const text = await resp.text();
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`Non-JSON response at ${url}: ${text.slice(0, 50)}`);
    }
  };

  // Fetch rates from API with robust fallbacks
  const fetchRates = async () => {
    try {
      // 1) Try same-origin serverless route
      try {
        const data = await fetchJsonSafe("/api/rates");
        const convertedRates = toState(data, data.source || "vercel_postgresql");
        setRates(convertedRates);
        setDataSource(data.source || "vercel_postgresql");
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      } catch (e) {
        console.warn("Primary /api/rates failed:", e.message);
      }

      // 2) Try absolute path (in case of domain/proxy issues)
      try {
        const origin = window?.location?.origin || "";
        const data = await fetchJsonSafe(`${origin}/api/rates`);
        const convertedRates = toState(data, data.source || "vercel_postgresql");
        setRates(convertedRates);
        setDataSource(data.source || "vercel_postgresql");
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      } catch (e) {
        console.warn("Absolute /api/rates failed:", e.message);
      }

      // 3) Fallback to external upstream feed
      const upstream = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";
      const raw = await fetchJsonSafe(upstream);

      // Map external keys: {"24K Gold":113000,"22K Gold":103960,"18K Gold":93790,"Silver":1340}
      const gold_24k_sale = Number(raw["24K Gold"]) || null;
      const gold_22k_sale = Number(raw["22K Gold"]) || null;
      const gold_18k_sale = Number(raw["18K Gold"]) || null;
      const silver_per_gram = raw?.Silver ? Number(raw.Silver) / 10 : null;

      const payload = {
        gold_24k_sale,
        gold_22k_sale,
        gold_18k_sale,
        silver_per_kg_sale: silver_per_gram != null ? silver_per_gram * 1000 : null,
        source: "businessmantra_api_fallback",
      };

      const convertedRates = toState(payload, payload.source);
      setRates(convertedRates);
      setDataSource(payload.source);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Failed to fetch rates (all fallbacks):", error);
      setRates({
        vedhani: "Error",
        ornaments22K: "Error",
        ornaments18K: "Error",
        silver: "Error",
      });
      setLastUpdated("Error - " + new Date().toLocaleTimeString());
      setDataSource("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(); // initial fetch

    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing rates...");
      fetchRates();
    }, 30000); // every 30s

    return () => clearInterval(refreshInterval); // cleanup
  }, []);

  // Format INR style
  const formatRate = (rate) => {
    if (!rate || rate === "Error" || rate === "Loading...") return rate;
    return parseFloat(rate).toLocaleString("en-IN");
  };

  // Icon + label for data source
  const getSourceIcon = () => {
    switch (dataSource) {
      case "vercel_postgresql":
        return "🐘 Live";
      case "local_postgresql":
        return "🏠 Local";
      case "local_server":
        return "🖥️ Server";
      case "local_sync":
        return "🔄 Sync";
      case "businessmantra_api_fallback":
        return "🌐 Fallback";
      case "loading":
        return "⏳ Loading";
      case "error":
        return "❌ Error";
      default:
        return "📡 API";
    }
  };

  if (isLoading) {
    return (
      <div className="icon_container">
        <span className="icon_wrapper">
          <BsGraphUpArrow />
        </span>
        <span className="title">Current Rates</span>
        <div className="tooltip">
          <h1>Loading Rates...</h1>
          <p style={{ textAlign: "center", color: "#666" }}>
            ⏳ Fetching latest gold rates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>

        {lastUpdated && (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#666",
              margin: "5px 0",
            }}
          >
            <p>Last updated: {lastUpdated}</p>
            <p style={{ fontSize: "10px", opacity: 0.8 }}>
              Source: {getSourceIcon()}
            </p>
          </div>
        )}

        <div className="border-line">
          <div className="line"></div>
        </div>

        <ul>
          <li className="rates">
            Vedhani <span>₹{formatRate(rates.vedhani)}</span>
          </li>
          <li className="rates">
            22KT <span>₹{formatRate(rates.ornaments22K)}</span>
          </li>
          <li className="rates">
            18KT <span>₹{formatRate(rates.ornaments18K)}</span>
          </li>
          <li className="rates">
            Silver <span>₹{formatRate(rates.silver)}/g</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
