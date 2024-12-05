import React, { useState ,useEffect} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from "@mui/material";
import { styled } from "@mui/system";
import { BiExpandAlt, BiCollapseAlt } from "react-icons/bi";
import { FaShoppingCart, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { db , collection } from "../config/Config"; 
import { addDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth } from "firebase/auth";

const StyledCard = styled(Card)(({ theme }) => ({
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px"
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: "20px 0",
  padding: "12px 24px",
  borderRadius: "8px"
}));

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const storedItems = localStorage.getItem("cartItems");
        if (storedItems) {
          setCartItems(JSON.parse(storedItems));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        setError("Failed to fetch cart data");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };

    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errors.email = !emailRegex.test(value) ? "Invalid email address" : "";
        break;
      case "phone":
        const phoneRegex = /^\d{10}$/;
        errors.phone = !phoneRegex.test(value) ? "Invalid phone number" : "";
        break;
      case "postalCode":
        const postalRegex = /^\d{5}(-\d{4})?$/;
        errors.postalCode = !postalRegex.test(value) ? "Invalid postal code" : "";
        break;
      default:
        errors[name] = !value ? `${name} is required` : "";
    }

    setFormErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode"];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      // If any required fields are missing, show a toast error message
      toast.error(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return; // Prevent form submission
    }

    setLoading(true);
  
    try {
      // Transform cartItems to only include product name and quantity
      const transformedCartItems = cartItems.map((item) => ({
        productId:item.id,
        productName: item.productName,
        quantity: item.quantity,
      }));
  
      // Calculate total
      const totalAmount = calculateTotal();
  
      // Add the data to Firestore
      const docRef = await addDoc(collection(db, "commands"), {
        ...formData,
        cartItems: transformedCartItems, // Use transformed data
        paymentMethod,
        totalAmount, // Include the total amount
        createdAt: new Date(),
        userId
      });
  
      if (paymentMethod === "online") {
        navigate("/payment", { state: { orderId: docRef.id, total: totalAmount } });
        setSuccessMessage(`Order placed successfully! Order ID: ${docRef.id}`);
        setCartItems([]);
        localStorage.removeItem("cartItems");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
        });
      } else {
        setSuccessMessage(`Order placed successfully! Order ID: ${docRef.id}`);
        setCartItems([]);
        localStorage.removeItem("cartItems");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
        });
      }
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0);
  };

  const calculateLineTotal = (price, quantity) => {
    return (price * quantity).toFixed(2); 
  };



  return (
    <>
    <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <FaShoppingCart style={{ marginRight: "10px" }} /> Checkout
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Order Summary
                </Typography>
                <IconButton
                  onClick={() => setExpanded(!expanded)}
                  aria-label={expanded ? "collapse" : "expand"}
                >
                  {expanded ? <BiCollapseAlt /> : <BiExpandAlt />}
                </IconButton>
              </Box>

              <Collapse in={expanded}>
                {cartItems.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{ p: 2, mb: 1, backgroundColor: "#f5f5f5", borderRadius: "8px" }}
                  >
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="body1">{item.productName}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">x{item.quantity}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: "right" }}>
                        <Typography variant="body1">
                          {calculateLineTotal(item.productPrice, item.quantity)}DT
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
                  <Typography variant="h6">
                    Total: {calculateTotal().toFixed(2)}DT
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Delivery Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.firstName)}
                    helperText={formErrors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.lastName)}
                    helperText={formErrors.lastName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+216</InputAdornment>,
                    inputProps: {
                      maxLength: 8, // Limit input to 8 digits
                      pattern: "^[0-9]{8}$", // Ensure only 8 digits are entered
                    }
                  }}
                />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.address)}
                    helperText={formErrors.address}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={Boolean(formErrors.city)}
                    helperText={formErrors.city}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="online"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FaCreditCard style={{ marginRight: "8px" }} />
                        Online Payment
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="cod"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FaMoneyBillWave style={{ marginRight: "8px" }} />
                        Cash on Delivery
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </StyledCard>

          <StyledButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Place Order"
            )}
          </StyledButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ position: { md: "sticky" }, top: "20px" }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Grid container justifyContent="space-between">
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">
                      {calculateTotal().toFixed(2)}DT
                    </Typography>
                  </Grid>
                  <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="body1">Shipping</Typography>
                    <Typography variant="body1">Free</Typography>
                  </Grid>
                  <Grid
                    container
                    justifyContent="space-between"
                    sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}
                  >
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">
                      {calculateTotal().toFixed(2)}DT
                    </Typography>
                  </Grid>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </Grid>
      </Grid>
    </Container>
    <Footer />
    </>
  );
};

export default CheckoutPage;