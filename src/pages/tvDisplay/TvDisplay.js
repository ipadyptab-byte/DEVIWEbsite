import React, { useState, useEffect } from 'react';
import './TvDisplay.css';

const TvDisplay = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/rates');
        if (res.ok) {
          const data = await res.json();
          setRates({
            vedhani: data.vedhani || "",
            ornaments22K: data.ornaments22K || "",
            ornaments18K: data.ornaments18K || "",
            silver: data.silver || "",
          });
          setLastUpdated(new Date());
        } else {
          console.error('Failed to fetch rates:', res.status);
        }
      } catch (err) {
        console.error('Error fetching rates:', err);
      }
    };

    // Initial fetch
    fetchRates();

    // Poll every 5 seconds
    const pollInterval = setInterval(fetchRates, 5000);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="tv-display">
      <div className="tv-header">
        <div className="company-info">
          <h1>DEVI JEWELLERS</h1>
          <p>Premium Jewellery Collection</p>
        </div>
        <div className="datetime-info">
          <div className="current-time">{formatTime(currentTime)}</div>
          <div className="current-date">{formatDate(currentTime)}</div>
        </div>
      </div>

      <div className="rates-container">
        <h2 className="rates-title">Today's Gold &amp; Silver Rates</h2>
        
        <div className="rates-grid">
          <div className="rate-card gold-vedhani">
            <div className="rate-label">Vedhani Gold</div>
            <div className="rate-value">₹{rates.vedhani || "---"}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card gold-22k">
            <div className="rate-label">22KT Gold</div>
            <div className="rate-value">₹{rates.ornaments22K || "---"}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card gold-18k">
            <div className="rate-label">18KT Gold</div>
            <div className="rate-value">₹{rates.ornaments18K || "---"}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card silver">
            <div className="rate-label">Silver</div>
            <div className="rate-value">₹{rates.silver || "---"}</div>
            <div className="rate-unit">per KG</div>
          </div>
        </div>

        <div className="update-info">
          {lastUpdated && (
            <>
              <div className="live-indicator">● LIVE</div>
              <div className="last-update">
                Last Updated: {formatTime(lastUpdated)} - {formatDate(lastUpdated)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="tv-footer">
        <div className="contact-info">
          <p>Visit our store for the latest collections | Call: +91-XXXXX-XXXXX</p>
        </div>
        <div className="ticker">
          <div className="ticker-content">
            Rates are subject to market fluctuations • Visit our showroom for accurate quotations • Premium quality assured
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvDisplay;