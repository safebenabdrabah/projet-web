import React, { useState, useEffect } from "react";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/Config.js"; // Import 'db' directly from config

function NewsAndPromotions() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(db, "NewsAndPromotions"));
      const fetchedImages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedImages.push(data.imageUrl); 
      });
      setImages(fetchedImages);
    };

    fetchImages();
  }, []);

  return (
    <div className="news-promotions">
      <Carousel autoPlay interval={3000}  showThumbs={false} infiniteLoop>
        {images.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`Promo ${index + 1}`} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default NewsAndPromotions;
