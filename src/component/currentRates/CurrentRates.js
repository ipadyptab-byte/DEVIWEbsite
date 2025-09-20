import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import './CurrentRates.css';

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchRates = async () => {
    try {
      const response = await fetch("/api/rates"); // ✅ valid
      const data = await response.json();
      setRates({
        vedhani: data.vedhani,
        ornaments22K: data.ornaments_22k,
        ornaments18K: data.ornaments_18k,
        silver: data.silver
      });
    } catch (error) {
      console.error("Error fetching rates:", error);
    }
  };

  fetchRates();
}, []);

        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Rates fetched from server:', data);
          
          // Convert to display format
          const convertedRates = {
            vedhani: data.gold_24k_sale?.toString() || "Loading...",
            ornaments22K: data.gold_22k_sale?.toString() || "Loading...",
            ornaments18K: data.gold_18k_sale?.toString() || "Loading...",
            silver: Math.round(data.silver_per_kg_sale / 1000).toString() || "Loading..." // Convert per KG to per gram
          };
          
          setRates(convertedRates);
          setLastUpdated(new Date().toLocaleTimeString());
          setDataSource('local_server');
          
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch rates:', error);
        setRates({
          vedhani: "Error",
          ornaments22K: "Error",
          ornaments18K: "Error",
          silver: "Error",
        });
        setLastUpdated("Error - " + new Date().toLocaleTimeString());
        setDataSource('error');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchRates();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing rates...');
      fetchRates();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Helper function to format rates with proper number formatting
  const formatRate = (rate) => {
    if (!rate || rate === "Error" || rate === "Loading...") {
      return rate;
    }
    // Add thousands separator for Indian number format
    return parseFloat(rate).toLocaleString('en-IN');
  };

  // Helper function to get source icon
  const getSourceIcon = () => {
    switch (dataSource) {
      case 'vercel_postgresql': return '🐘 Live';
      case 'local_postgresql': return '🏠 Local';
      case 'local_server': return '🖥️ Server';
      case 'local_sync': return '🔄 Sync';
      case 'loading': return '⏳ Loading';
      case 'error': return '❌ Error';
      default: return '📡 API';
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
          <p style={{textAlign: 'center', color: '#666'}}>⏳ Fetching latest gold rates...</p>
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
          <div style={{textAlign: 'center', fontSize: '12px', color: '#666', margin: '5px 0'}}>
            <p>Last updated: {lastUpdated}</p>
            <p style={{fontSize: '10px', opacity: 0.8}}>
              Source: {getSourceIcon()}
            </p>
          </div>
        )}
        <div className='border-line'>
          <div className="line"></div>
        </div>
        <ul>
          <li className='rates'>
            Vedhani <span>₹{formatRate(rates.vedhani)}</span>
          </li>
          <li className='rates'>
            22KT <span>₹{formatRate(rates.ornaments22K)}</span>
          </li>
          <li className='rates'>
            18KT <span>₹{formatRate(rates.ornaments18K)}</span>
          </li>
          <li className='rates'>
            Silver <span>₹{formatRate(rates.silver)}/g</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
