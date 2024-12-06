import React, { useState , useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Avatar,
  Paper,
  InputAdornment,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { styled } from "@mui/system";
import { FaEdit, FaHeart, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { updateDoc, collection, getDocs, query, where, doc, getDoc , deleteDoc } from "firebase/firestore";
import {db , auth } from "../config/Config"; 
import ProductCard from "./ProductCard";
import AddProducts from "./AddProducts";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
  }
}));

const ProfileImage = styled(Avatar)({
  width: 150,
  height: 150,
  margin: "0 auto 20px",
  border: "4px solid white",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
});

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [userDetails, setUserDetails] = useState({});
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        console.log("User is logged in:", currentUser);
        const userRef = doc(db, "SignedUpUserData", currentUser.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No user data found in Firestore.");
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  // Function to update user data
  const updateUserData = async (newData) => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const userRef = doc(db, "SignedUpUserData", user.uid);

    try {
      await updateDoc(userRef, newData); // Update specific fields
      setUserData((prev) => ({ ...prev, ...newData })); // Update state locally
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Function to delete user data
  const deleteUserData = async () => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const userRef = doc(db, "SignedUpUserData", user.uid);

    try {
      await deleteDoc(userRef); // Delete document from Firestore
      setUserData(null); // Reset state locally
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };

 
  useEffect(() => {
    // Fetch liked products
    const fetchLikedProducts = async () => {
      try {
        const likedProductIds = userData.likedproducts|| []; 
        const productPromises = likedProductIds.map((id) => getDoc(doc(db, "products", id)));
        const productDocs = await Promise.all(productPromises);
        const products = productDocs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLikedProducts(products);
      } catch (error) {
        console.error("Error fetching liked products:", error);
      }
    };

    // Fetch purchased products

    const fetchPurchasedProducts = async () => {
      try {
        const q = query(collection(db, "commands"), where("userId", "==",  auth.currentUser.uid));
        console.log(userData.id)
        const querySnapshot = await getDocs(q);
        const purchasedProductIds = [];
        console.log(purchasedProductIds);
        querySnapshot.forEach((doc) => {
          const { cartItems } = doc.data();
          purchasedProductIds.push(...cartItems.map((item) => item.productId)); // Assuming cartItems have productId
        });

        const productPromises = purchasedProductIds.map((id) => getDoc(doc(db, "products", id)));
        const productDocs = await Promise.all(productPromises);
        const products = productDocs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPurchasedProducts(products);
      } catch (error) {
        console.error("Error fetching purchased products:", error);
      }
    };

    fetchLikedProducts();
    fetchPurchasedProducts();
  }, [userData]);
  

  useEffect(() => {
    const fetchAddedProducts = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.uid) {
        console.error("No authenticated user found");
        return;
      }

      try {
        const q = query(
          collection(db, "products"),
          where("user", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const products = [];

        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() }); // Include doc ID and data
        });

        setAddedProducts(products);
      } catch (error) {
        console.error("Error fetching added products:", error);
      }
    };

      fetchAddedProducts();
    }, []);
  

   
  // Handle input changes for email and password

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const validatePassword = (password) => {
    // Simple password validation: length must be at least 6 characters
    return password.length >= 6;
  };
  
  const handleEmailChange = (e) => {
    const updatedEmail = e.target.value;
    setUserDetails({ ...userData, Email: updatedEmail });
  };
  
  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  
  // Save changes to Firestore
  const handleSave = async () => {
    if (!isValidEmail(userData.Email)) {
      alert("Invalid email format");
      return;
    }
  
    const userRef = doc(db, 'SignedUpUserData', auth.currentUser.uid); // Assuming userData has id field
    try {
      // Update user details
      const updatedUser = {
        Username: userData.Username,
        Email: userData.Email,
      };
  
      // Handle password change securely
      if (newPassword) {
        if (validatePassword(newPassword)) {
          updatedUser.password = newPassword;
        } else {
          alert('Password is too weak');
          return;
        }
      }
  
      // Update the user data in Firestore
      await updateDoc(userRef, updatedUser);
  
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  };

  return (
    <>
    <Navbar />
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              {/* Profile Image Section */}
              <img
                src={ userData.profileImage || '../images/profile.png'}
                alt="Profile"
                style={{ width: 120, height: 120, borderRadius: '50%' }}
              />
              {/* Profile Details Form */}
              <Box component="form">
                <TextField
                  fullWidth
                  label="Name"
                  value={userData.Username}
                  onChange={(e) => setUserDetails({ ...userData, Username: e.target.value })}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                  InputProps={{
                    'aria-label': 'User name',
                  }}
                />
              <TextField
                  fullWidth
                  label="Email"
                  value={userData.Email}
                  onChange={handleEmailChange}
                  disabled={!editMode}
                  error={userData.Email && !isValidEmail(userData.Email)}  // Use isValidEmail to check the email format
                  helperText={userData.Email && !isValidEmail(userData.Email) ? 'Invalid email format' : ''}
                  sx={{ mb: 2 }}
                  InputProps={{
                    'aria-label': 'User email',
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  disabled={!editMode}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    'aria-label': 'User password',
                  }}
                />
                <Box sx={{ mt: 2 }}>
                  {!editMode ? (
                    <Button
                      startIcon={<FaEdit />}
                      variant="contained"
                      onClick={() => setEditMode(true)}
                      aria-label="Edit profile"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      color="primary"
                      aria-label="Save profile changes"
                    >
                      Save Changes
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
  
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => setOpenDialog(true)}
              sx={{ mb: 3 }}
              aria-label="Add new product"
            >
              Add Product
            </Button>
  
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Added Products ({addedProducts.length}) :
              </Typography>
              <Grid container spacing={2}>
                {addedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>

              {/* Purchased Products */}
              <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Purchased Products ({purchasedProducts.length}) :
              </Typography>
              <Grid container spacing={2}>
                {purchasedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
             
            {/* Liked Products */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Liked Products ({likedProducts.length}) :
              </Typography>
              <Grid container spacing={2}>
               
                {likedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
  
          
          </Box>
        </Grid>
      </Grid>
  
      {/* Add Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <AddProducts />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    <Footer />
  </>
  
  
  );
};

export default Profile;