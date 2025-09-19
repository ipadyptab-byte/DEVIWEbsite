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
        const documentId = "GF8lmn4pjyeuqPzA0xDE";
        const docRef = doc(db, "rates", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRates(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching rates: ", error);
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
