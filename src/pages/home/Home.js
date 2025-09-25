import React, { useState, useEffect } from 'react';
import './Home.scss';
import Services from '../../component/services/Services';
import Trending from '../../component/trending/Trending';
import Collections from '../../component/collections/Collections';
import { Banner } from '../../component/banner/Banner';
import AboutSection from '../../component/about/AboutSection';
import AboutInfoSection from '../../component/about/aboutinfo';
import Schemess from '../../component/schemess/Schemes';
import Hero from '../../component/hero/Hero';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { safeGetStorage } from '../../lib/firebase';

const Home = () => {
  const [latestImageUrl, setLatestImageUrl] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  useEffect(() => {
    const fetchLatestImage = async () => {
      const storage = safeGetStorage();
      if (!storage) {
        // Firebase not configured or failed to initialize; skip popup image
        return;
      }
      const listRef = ref(storage, 'images/');
      try {
        const res = await listAll(listRef);

        if (res.items.length > 0) {
          // Sort items by the timestamp in the file name
          const sortedItems = res.items.sort((a, b) => {
            const aTimestamp = parseInt(a.name.split('_')[0], 10);
            const bTimestamp = parseInt(b.name.split('_')[0], 10);
            return bTimestamp - aTimestamp;
          });

          const latestItem = sortedItems[0]; // Get the most recent image
          const url = await getDownloadURL(latestItem);
          setLatestImageUrl(url);
        }
      } catch {
        // ignore firebase errors
      }
    };

    fetchLatestImage();
  }, []);

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <>
      {latestImageUrl && isPopupVisible && (
        <div
          className="popup"
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          <img
            src={latestImageUrl}
            alt="Latest Uploaded"
            style={{ maxHeight: '90%', maxWidth: '90%' }}
          />
        </div>
      )}

      <div className="hero_image m_70">
        <Hero />
      </div>
      <div className="mx_width themeContainer">
        <Services />
        <Trending />
        <Collections />
      </div>
      <div className="fluid">
        <Banner />
      </div>
      <h1 style={{ textAlign: 'center', fontFamily: '"El Messiri", sans-serif' }}>
        About Us
      </h1>
      <AboutSection />
      <AboutInfoSection />

      <h1 style={{ textAlign: 'center', fontFamily: '"El Messiri", sans-serif' }}>
        Schemes
      </h1>
      <Schemess />

      <div className="mx_width themeContainer m_70">
        {/* <Blog/> */}
      </div>
    </>
  );
};

export default Home;
