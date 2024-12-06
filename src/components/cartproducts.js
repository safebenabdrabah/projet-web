import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaPlus, FaMinus, FaTrash, FaInfoCircle } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SingleProduct from "./SingleProduct";
import Snackbar from "@mui/material/Snackbar";


const StyledCard = styled(Card)(({ theme }) => ({
  margin: "16px 0",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  padding: "4px",
}));

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedProduct,setSelectedProduct]=useState()
  const navigate = useNavigate();

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

  const handleToastClose = () => {
    setToastOpen(false); // Close the toast
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  const calculateLineTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Shopping Cart
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <StyledCard key={item.id}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={item.images[0]} // Display product image
                        alt={item.productName}
                        sx={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Stack spacing={2}>
                        <Typography variant="h6" component="h2">
                          {item.productName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {calculateLineTotal(item.productPrice, item.quantity)} DT
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <QuantityButton onClick={() => updateCartQuantity(item.id, -1)}>
                            <FaMinus />
                          </QuantityButton>
                          <Typography>{item.quantity}</Typography>
                          <QuantityButton onClick={() => updateCartQuantity(item.id, 1)}>
                            <FaPlus />
                          </QuantityButton>
                          <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                            <FaTrash />
                          </IconButton>
                          <Button
                            variant="outlined"
                            startIcon={<FaInfoCircle />}
                            onClick={() => handleProductClick(item.id)} // Navigate to SingleProduct page
                          >
                            More Details
                          </Button>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mt: 2 }}>
                  Total: {calculateTotal()} DT
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={cartItems.length === 0}
                  onClick={handleCheckoutClick}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialog for product details */}
        <Dialog
          open={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          aria-labelledby="product-dialog-title"
        >
          <DialogTitle id="product-dialog-title">
            {selectedProduct?.productName || "No Title"}
          </DialogTitle>

          <DialogContent>
            {selectedProduct?.productId ? (
              <div onClick={() => handleProductClick(selectedProduct.productId)}>
                <SingleProduct productId={selectedProduct.productId} />
              </div>
            ) : (
              <Typography>No product selected</Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setSelectedProduct(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Footer />
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleToastClose}
      >
        <Alert onClose={handleToastClose} severity="error" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShoppingCart;
