import React, { useState, useEffect } from 'react';
import './TvDisplay.css';

const TvDisplayDemo = () => {
  const [rates, setRates] = useState({
    vedhani: "72,450",
    ornaments22K: "71,200",
    ornaments18K: "58,900",
    silver: "85,600",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate real-time rate updates every 30 seconds
    const rateInterval = setInterval(() => {
      setRates({
        vedhani: String(72000 + Math.floor(Math.random() * 1000)).toLocaleString(),
        ornaments22K: String(71000 + Math.floor(Math.random() * 500)).toLocaleString(),
        ornaments18K: String(58500 + Math.floor(Math.random() * 800)).toLocaleString(),
        silver: String(85000 + Math.floor(Math.random() * 1200)).toLocaleString(),
      });
      setLastUpdated(new Date());
      console.log("TV Display Demo: Rates updated in real-time");
    }, 30000); // Update every 30 seconds

    // Cleanup
    return () => {
      clearInterval(timeInterval);
      clearInterval(rateInterval);
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
        <h2 className="rates-title">Today's Gold & Silver Rates</h2>
        
        <div className="rates-grid">
          <div className="rate-card gold-vedhani">
            <div className="rate-label">Vedhani Gold</div>
            <div className="rate-value">₹{rates.vedhani}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card gold-22k">
            <div className="rate-label">22KT Gold</div>
            <div className="rate-value">₹{rates.ornaments22K}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card gold-18k">
            <div className="rate-label">18KT Gold</div>
            <div className="rate-value">₹{rates.ornaments18K}</div>
            <div className="rate-unit">per 10 grams</div>
          </div>

          <div className="rate-card silver">
            <div className="rate-label">Silver</div>
            <div className="rate-value">₹{rates.silver}</div>
            <div className="rate-unit">per KG</div>
          </div>
        </div>

        <div className="update-info">
          <div className="live-indicator">● DEMO MODE</div>
          <div className="last-update">
            Last Updated: {formatTime(lastUpdated)} - {formatDate(lastUpdated)}
          </div>
        </div>
        
        <div style={{textAlign: 'center', marginTop: '20px', fontSize: '1rem', color: '#FFD700'}}>
          Auto-updates every 30 seconds | Visit /tv-display for Firebase version
        </div>
      </div>

      <div className="tv-footer">
        <div className="contact-info">
          <p>Visit our store for the latest collections | Call: +91-XXXXX-XXXXX</p>
        </div>
        <div className="ticker">
          <div className="ticker-content">
            Rates are subject to market fluctuations • Visit our showroom for accurate quotations • Premium quality assured • Real-time updates from Firebase
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvDisplayDemo;