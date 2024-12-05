import React, { useEffect, useState } from "react";
import "../css/mostLikedProducts.css";
import ProductCard from "./ProductCard"; 
import { collection, db } from "../config/Config"; 
import { getDocs } from "firebase/firestore";

function MostLikedProducts() {
  const [mostLiked, setMostLiked] = useState([]);

  useEffect(() => {
    const fetchMostLikedProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);

        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id, 
          ...doc.data(),
        }));

      
        const sortedProducts = products.sort((a, b) => b.likes - a.likes).slice(0, 6);

        setMostLiked(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchMostLikedProducts();
  }, []);

  return (
    <div className="most-liked-products">
      <h2>Most Liked Products</h2>
      <div className="product-container">
        {mostLiked.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
}

export default MostLikedProducts;
