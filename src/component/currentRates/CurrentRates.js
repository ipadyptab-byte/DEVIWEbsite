import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase'; 
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';  

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani24k: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });

  useEffect(() => {
  const fetchRates = async () => {
    try {
      const response = await fetch("/api/rates");
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

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>  
      <span className="title">Current Rates</span> 

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <div className='border-line'>
        <img src={borderLine} alt='border line'/>
        </div>
        <ul>
          <li className='rates'>Vedhani24k  <span>₹{rates.vedhani24k || "N/A"}</span></li><br/>
          <li className='rates'> 22KT <span>₹{rates.ornaments22K || "N/A"}</span></li><br/>
          <li className='rates'>18KT <span>₹{rates.ornaments18K || "N/A"}</span></li><br/>
          <li className='rates'>Silver <span>₹{rates.silver || "N/A"}</span></li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
