import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/Config"; // Import Firestore instance

// Create the context
const ProductContext = createContext();

// Custom hook to use the context
export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    // Fetch products based on the selected category and sortBy
    const fetchProducts = async (selectedCategory, sortBy) => {
      setLoading(true); // Start loading
      setError(""); // Reset error
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", selectedCategory.toLowerCase())
          // Add additional Firestore sorting logic here if necessary
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Apply sorting manually if needed
        if (sortBy === "price-low") {
          fetchedProducts.sort((a, b) => a.productPrice - b.productPrice);
        } else if (sortBy === "price-high") {
          fetchedProducts.sort((a, b) => b.productPrice - a.productPrice);
        } else if (sortBy === "newest") {
          fetchedProducts.sort((a, b) => b.createdAt - a.createdAt); // Assuming `dateAdded` exists
        } else if (sortBy === "likes") {
          fetchedProducts.sort((a, b) => b.likes - a.likes); // Sort by likes
        }
  
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    };
  return (
    <ProductContext.Provider value={{ products, fetchProducts, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};
