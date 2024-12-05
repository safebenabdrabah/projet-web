import React, { useState, useEffect } from "react";
import { deleteDoc } from "firebase/firestore";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaShoppingCart } from "react-icons/fa";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { db, auth } from "../config/Config";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../global/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SingleProduct = () => {
  const { productId } = useParams(); // Get the productId from the route params
  console.log(productId)
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const [productData, setProductData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentUserId = auth.currentUser?.uid;

  // Fetch product data from Firestore
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const data = productSnap.data();
          setProductData(data);
          setLikes(data.likes || 0);
          setCreatedAt(data.createdAt?.toDate() || null);
        } else {
          setError("Product not found.");
          setOpen(true);
        }
      } catch (err) {
        setError("Failed to fetch product data. Please try again.");
        setOpen(true);
      }
    };

    fetchProductData();
  }, [productId]);

  // Fetch like status from Firestore
  useEffect(() => {
    const fetchLikedStatus = async () => {
      if (!auth.currentUser || !productId) return;

      try {
        const userRef = doc(db, "SignedUpUserData", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const likedProducts = userSnap.data().likedproducts || [];
          setIsLiked(likedProducts.includes(productId));
        }
      } catch (err) {
        console.error("Failed to fetch liked status:", err);
      }
    };

    fetchLikedStatus();
  }, [productId]);

  // Handle like/unlike action
  const handleLikeClick = async () => {
    if (!auth.currentUser || !productId) {
      setError("You need to log in to like a product.");
      setOpen(true);
      return;
    }

    try {
      const productRef = doc(db, "products", productId);
      const userRef = doc(db, "SignedUpUserData", auth.currentUser.uid);

      if (isLiked) {
        await updateDoc(productRef, { likes: increment(-1) });
        await updateDoc(userRef, { likedproducts: arrayRemove(productId) });
      } else {
        await updateDoc(productRef, { likes: increment(1) });
        await updateDoc(userRef, { likedproducts: arrayUnion(productId) });
      }

      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
    } catch (err) {
      setError("Failed to update likes. Please try again.");
      setOpen(true);
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (productData) {
      addToCart({ id: productId, ...productData });
      setToastMessage(`${productData.productName} has been added to your cart!`);
      setToastOpen(true);
    }
  };

  const handleToastClose = () => setToastOpen(false);

  const formatCreatedAt = createdAt ? createdAt.toLocaleDateString() : null;

  if (!productData) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Loading product data...
        </Typography>
      </Container>
    );
  }

  const handleEditProduct = () => {
    navigate(`/edit-product/${productId}`);
  };
  
  // Delete the product from Firestore
  const handleDeleteProduct = async () => {
    if (!auth.currentUser) {
      setError("You need to log in to delete a product.");
      setOpen(true);
      return;
    }
  
    try {
      // Delete the product from Firestore
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
  
      // Optionally, delete it from the user's liked products if necessary
      const userRef = doc(db, "SignedUpUserData", auth.currentUser.uid);
      await updateDoc(userRef, { likedproducts: arrayRemove(productId) });
  
      // Optionally, navigate the user away after deletion
      navigate("/"); // Redirect to home or another page
      setToastMessage("Product deleted successfully.");
      setToastOpen(true);
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      setOpen(true);
    }
  };

  return (
    <>
       <Navbar/>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* Product Image Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <img
                  src={productData.images?.[currentImageIndex] || ""}
                  alt={productData.productName || "Product"}
                  style={{ width: "100%", borderRadius: "12px" }}
                  loading="lazy"
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === 0
                        ? productData.images.length - 1
                        : currentImageIndex - 1
                    )
                  }
                >
                  <MdKeyboardArrowLeft />
                </IconButton>
                <IconButton
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex + 1) % productData.images.length
                    )
                  }
                >
                  <MdKeyboardArrowRight />
                </IconButton>
              </Box>
            </Grid>
      
            {/* Product Details Section */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h4">{productData.productName}</Typography>
                <Typography variant="h5" color="primary">
                  {productData.productPrice.toFixed(2)} DT
                </Typography>
                <Typography>{productData.description}</Typography>
                <Typography>Category: {productData.category || "Uncategorized"}</Typography>
                <Typography>Created at: {formatCreatedAt || "Not available"}</Typography>
      
                {/* Show Edit/Delete buttons if the current user is the product owner */}
                {productData.user === currentUserId && (
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleEditProduct}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDeleteProduct}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
      
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FaShoppingCart />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <IconButton onClick={handleLikeClick} color="primary">
                    {isLiked ? <BsHeartFill /> : <BsHeart />}
                  </IconButton>
                  <Typography>{likes} likes</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
      
          {/* Toast Snackbar */}
          <Snackbar
            open={toastOpen}
            autoHideDuration={3000}
            onClose={handleToastClose}
          >
            <Alert severity="success">{toastMessage}</Alert>
          </Snackbar>
        </Container>
        <Footer/>
    </>
  );
  
};

export default SingleProduct;
