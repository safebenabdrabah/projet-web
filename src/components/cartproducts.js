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
import { useCart } from "../global/CartContext";
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
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { loading, error, cartItems,  updateCartQuantity, removeFromCart, calculateTotal , toastOpen,
    toastMessage,
    setToastOpen,} = useCart();

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
                   onClick={handleCheckoutClick}>
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
            <Alert onClose={handleToastClose} severity="error" sx={{ width: '100%' }}>
                      {toastMessage}
            </Alert>
      </Snackbar>
    </>
  );
};

export default ShoppingCart;
