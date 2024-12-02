import React, { useState, useEffect, useContext } from "react";
import { auth, db } from "../config/Config.js"; 
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { CartContext } from "../global/CartContext.js";
import ProductCard from "./ProductCard"; 

function Products() {
  const [products, setProducts] = useState([]);
  const { shoppingCart, dispatch } = useContext(CartContext);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,  // Make sure to include product ID
      ...doc.data(),
    }));
    setProducts(productsData);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle adding products to the cart
  const handleAddToCart = async (product) => {
    const user = auth.currentUser;

    if (user) {
      // If the user is authenticated, save the cart in Firestore
      const cartRef = doc(db, `cart_${user.uid}`, product.id);
      await setDoc(cartRef, { ...product, quantity: 1 });
    } else {
      // If the user is not authenticated, save the cart in localStorage
      const updatedCart = [...shoppingCart, { ...product, quantity: 1 }];
      dispatch({ type: "SET_CART", payload: updatedCart });  // Update the global cart context
      localStorage.setItem("cart", JSON.stringify(updatedCart));  // Save to localStorage
    }
  };

  return (
    <div className="product-container">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
}

export default Products;
