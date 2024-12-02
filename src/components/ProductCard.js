import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Button, Snackbar, Alert, styled } from "@mui/material";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { db , auth } from "../config/Config"; 
import { doc, updateDoc, increment, getDoc , arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../global/CartContext";

const StyledCard = styled(Card)(() => ({
  maxWidth: 345,
  margin: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)"
  }
}));

const ProductCard = ({ product }) => {

  const { addToCart } = useCart();
  const [likes, setLikes] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [createdAt, setCreatedAt] = useState(null); // State to store createdAt date
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false); // For the toast
  const [toastMessage, setToastMessage] = useState(""); // For custom toast message
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productRef = doc(db, "products", product.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          setLikes(productSnap.data().likes || 0); // Set initial likes
          setCreatedAt(productSnap.data().createdAt?.toDate()); // Set the createdAt date
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        setOpen(true);
      }
    };

    fetchProductData();
  }, [product.id]);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      try {
        const userRef = doc(db, "SignedUpUserData", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const likedProducts = userSnap.data().likedproducts || [];
          setIsLiked(likedProducts.includes(product.id)); // Check if the product is liked
        }
      } catch (err) {
        console.error("Failed to fetch liked status:", err);
      }
    };

    fetchLikedStatus();
  }, [product.id]);

  // Handle like button click
  const handleLikeClick = async () => {
    try {
      const productRef = doc(db, "products", product.id);
      const userRef = doc(db, "SignedUpUserData", auth.currentUser.uid);

      if (isLiked) {
        // Unlike the product
        await updateDoc(productRef, {
          likes: increment(-1)
        });
        await updateDoc(userRef, {
          likedproducts: arrayRemove(product.id)
        });
      } else {
        // Like the product
        await updateDoc(productRef, {
          likes: increment(1)
        });
        await updateDoc(userRef, {
          likedproducts: arrayUnion(product.id)
        });
      }

      // Update local state
      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
    } catch (err) {
      setError("Failed to update likes. Please try again.");
      setOpen(true);
    }
  };

  


  const handleClose = () => {
    setOpen(false);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
};

  const handleAddToCart = () => {
    addToCart(product); // Add to cart functionality
    setToastMessage(`${product.productName} has been added to your cart!`); // Custom message for the toast
    setToastOpen(true); // Show toast
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  // Format the createdAt date to a readable format
  const formatCreatedAt = createdAt ? createdAt.toLocaleDateString() : null;

  return (
    <StyledCard role="article" aria-label="Product Card">
      <CardMedia
        component="img"
        height="200"
        image={product.images[0]}
        alt={product.productName}
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1633078654544-61b3455b9161"; // fallback image
        }}
        onClick={handleCardClick}
      />
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2" gutterBottom>
            {product.productName}
          </Typography>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleLikeClick}
              aria-label={isLiked ? "Unlike product" : "Like product"}
              color="primary"
            >
              {isLiked ? <BsHeartFill /> : <BsHeart />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likes}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Category: {product.category}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created At: {formatCreatedAt} {/* Display createdAt */}
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {product.productPrice} Dt
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAddToCart} // Call the new function to add to cart and show the toast
          aria-label="Add to cart"
          sx={{
            mt: 2,
            borderRadius: "20px",
            textTransform: "none",
            "&:hover": {
              transform: "scale(1.02)"
            }
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={handleToastClose}>
        <Alert onClose={handleToastClose} severity="success" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error.includes("successfully") ? "success" : "error"} sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </StyledCard>
  );
};

export default ProductCard;
