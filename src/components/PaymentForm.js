import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../config/Config";
import { doc , getDoc} from "firebase/firestore";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  styled,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { FaCreditCard } from "react-icons/fa";
import dayjs from "dayjs";
import Footer from "./Footer";
import Navbar from "./Navbar";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "2rem auto",
  padding: theme.spacing(3),
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  borderRadius: 15,
}));

const FormContainer = styled(Box)({
  backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  minHeight: "100vh",
  padding: "2rem",
});

const PaymentForm = () => {
  const location = useLocation();
  const { orderId, total } = location.state || {};

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: null,
    cvv: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateField(field, value);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (!value) {
      newErrors[field] = "This field is required";
    } else {
      delete newErrors[field];
    }

    if (field === "cardNumber") {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      } else {
        delete newErrors.cardNumber;
      }
    }

    if (field === "cvv" && !/^\d{3,4}$/.test(value)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, expiryDate: date }));
    if (!date) {
      setErrors((prev) => ({ ...prev, expiryDate: "Expiry date is required" }));
    } else {
      setErrors((prev) => {
        const { expiryDate, ...rest } = prev;
        return rest;
      });
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const orderRef = doc(db, "commands", orderId); // Assuming you have an 'orders' collection
      const orderDoc = await getDoc(orderRef);
  
      if (orderDoc.exists) {
        return orderDoc.data(); // This will return the order data, including the email
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const orderDetails = await fetchOrderDetails(orderId); // Fetch details from Firebase
      
      if (!orderDetails) {
        console.error("Order details not found");
        setLoading(false);
        return;
      }
  
      const emailData = {
        orderId,
        total,
        email: orderDetails.email || "no-email@example.com", // Use a fallback if email is missing
        cartItems: orderDetails.cartItems || [], // Include cart items
        paymentDetails: formData, // Include form data
      };
  
      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
  
      if (response.ok) {
        setSubmitted(true);
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  

  if (submitted) {
    return (
        <>
           <Navbar />
            <FormContainer>
                <StyledCard>
                <Alert severity="success">
                    Payment processed successfully! Thank you for your payment. check you mail.
                </Alert>
                </StyledCard>
            </FormContainer>
           <Footer />
      </>
    );
  }

  return (
    <>
    <Navbar />
    <FormContainer>
      <StyledCard>
        <CardContent>
          <Box mb={3}>
            <Typography variant="h5" component="h2">
              Payment for Order {orderId || "N/A"}
            </Typography>
            <Typography variant="body1">
              Total Amount: ${total || "N/A"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={3}>
            <FaCreditCard size={24} style={{ marginRight: "10px" }} />
            <Typography variant="h4" component="h1">
              Payment Details
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  fullWidth
                  value={formData.cardNumber}
                  onChange={handleInputChange("cardNumber")}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Expiry Date"
                    value={formData.expiryDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.expiryDate}
                        helperText={errors.expiryDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVV"
                  fullWidth
                  value={formData.cvv}
                  onChange={handleInputChange("cvv")}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Street Address"
                  fullWidth
                  value={formData.street}
                  onChange={handleInputChange("street")}
                  error={!!errors.street}
                  helperText={errors.street}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={formData.city}
                  onChange={handleInputChange("city")}
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="State"
                  fullWidth
                  value={formData.state}
                  onChange={handleInputChange("state")}
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="ZIP Code"
                  fullWidth
                  value={formData.zipCode}
                  onChange={handleInputChange("zipCode")}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || Object.keys(errors).length > 0}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Process Payment"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </StyledCard>
    </FormContainer>
    <Footer />
    </>
  );
};

export default PaymentForm;
