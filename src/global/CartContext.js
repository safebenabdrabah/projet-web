import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the shopping cart
const CartContext = createContext();

// Cart Provider to encapsulate the shopping cart logic
export const CartProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch cart data from localStorage on mount
  useEffect(() => {
    const fetchCartItems = () => {
      setLoading(true);
      try {
        const storedItems = localStorage.getItem("cartItems");
        if (storedItems) {
          setCartItems(JSON.parse(storedItems));
        } else {
          setCartItems([]);
        }
      } catch (err) {
        setError("Failed to fetch cart data");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Add or update cart item in localStorage
  const addToCart = (product) => {
    setLoading(true);
    try {
      const updatedCart = [...cartItems];
      const existingProductIndex = updatedCart.findIndex((item) => item.id === product.id);
      
      if (existingProductIndex !== -1) {
        updatedCart[existingProductIndex].quantity += 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }

      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    } catch (err) {
      setError("Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  // Update the quantity of an item in the cart
  const updateCartQuantity = (id, change) => {
    setLoading(true);
    try {
      const updatedItems = cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) {
            setToastMessage("Quantity cannot be less than 1");
            setToastOpen(true);
            return item; // Don't update the item if the quantity is invalid
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCartItems(updatedItems);
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (id) => {
    setLoading(true);
    try {
      const updatedItems = cartItems.filter((item) => item.id !== id);
      setCartItems(updatedItems);
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    } catch (err) {
      setError("Failed to remove item from cart");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the total price of items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0).toFixed(2);
  };

  // Provide context to children components
  return (
    <CartContext.Provider
      value={{
        loading,
        error,
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        calculateTotal,
        toastOpen,
        toastMessage,
        setToastOpen,
        setToastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to access cart context
export const useCart = () => {
  return useContext(CartContext);
};
