import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';  

const CurrentRatesDemo = () => {
  const [rates, setRates] = useState({
    vedhani: "72,450",
    ornaments22K: "71,200",
    ornaments18K: "58,900",
    silver: "85,600",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Simulate real-time rate updates every 30 seconds
    const interval = setInterval(() => {
      setRates(prevRates => ({
        vedhani: String(72000 + Math.floor(Math.random() * 1000)),
        ornaments22K: String(71000 + Math.floor(Math.random() * 500)),
        ornaments18K: String(58500 + Math.floor(Math.random() * 800)),
        silver: String(85000 + Math.floor(Math.random() * 1200)),
      }));
      setLastUpdated(new Date().toLocaleTimeString());
      console.log("Demo: Rates updated in real-time");
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>  
      <span className="title">Current Rates (Demo)</span> 

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <p style={{textAlign: 'center', fontSize: '12px', color: '#666', margin: '5px 0'}}>
          Last updated: {lastUpdated}
        </p>
        <div className='border-line'>
          <img src={borderLine} alt='border line'/>
        </div>
        <ul>
          <li className='rates'>Vedhani  <span>₹{rates.vedhani}</span></li><br/>
          <li className='rates'> 22KT <span>₹{rates.ornaments22K}</span></li><br/>
          <li className='rates'>18KT <span>₹{rates.ornaments18K}</span></li><br/>
          <li className='rates'>Silver <span>₹{rates.silver}</span></li>
        </ul>
        <p style={{textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '10px'}}>
          Demo Mode: Auto-updates every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default CurrentRatesDemo;