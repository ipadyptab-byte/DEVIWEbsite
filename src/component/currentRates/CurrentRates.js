import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/Firebase'; 
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';  

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const documentId = "GF8lmn4pjyeuqPzA0xDE";
    const docRef = doc(db, "rates", documentId);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setRates(docSnap.data());
        setLastUpdated(new Date().toLocaleTimeString());
        console.log("Rates updated in real-time");
      } else {
        console.log("No such document!");
      }
    }, (error) => {
      console.error("Error listening to rates: ", error);
      // Fallback to show cached/default rates
      setRates({
        vedhani: "Loading...",
        ornaments22K: "Loading...",
        ornaments18K: "Loading...",
        silver: "Loading...",
      });
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>  
      <span className="title">Current Rates</span> 

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        {lastUpdated && (
          <p style={{textAlign: 'center', fontSize: '12px', color: '#666', margin: '5px 0'}}>
            Last updated: {lastUpdated}
          </p>
        )}
        <div className='border-line'>
        <img src={borderLine} alt='border line'/>
        </div>
        <ul>
          <li className='rates'>Vedhani  <span>₹{rates.vedhani || "N/A"}</span></li><br/>
          <li className='rates'> 22KT <span>₹{rates.ornaments22K || "N/A"}</span></li><br/>
          <li className='rates'>18KT <span>₹{rates.ornaments18K || "N/A"}</span></li><br/>
          <li className='rates'>Silver <span>₹{rates.silver || "N/A"}</span></li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
