import React, { useState } from "react";
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
import { useUser } from "../global/UserContext";
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
  const { userData, updateUserData, deleteUserData } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  console.log(userData);


  const purchasedProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "$199",
      image: "images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "$299",
      image: "images.unsplash.com/photo-1523275335684-37898b6baf30"
    }
  ];

  const likedProducts = [
    {
      id: 3,
      name: "Premium Laptop",
      price: "$1299",
      image: "images.unsplash.com/photo-1496181133206-80ce9b88a853"
    },
    {
      id: 4,
      name: "Digital Camera",
      price: "$799",
      image: "images.unsplash.com/photo-1526170375885-4d8ecf77b99f"
    }
  ];

  const handleSave = () => {
    setEditMode(false);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const updatedEmail = e.target.value;
    if (validateEmail(updatedEmail)) {
      updateUserData({ email: updatedEmail });
    }
    };

   const handleUnlike = (productId) => {
    // Implementation for unlike functionality
    console.log("Unliked product:", productId);
  };

  const DeleteAccount = () => {
    const { deleteUserData } = useUser();
  
    const handleDelete = async () => {
      if (window.confirm("Are you sure you want to delete your account?")) {
        await deleteUserData();
        alert("Account deleted successfully!");
      }
    };
  }

  return (
    <>
    <Navbar/>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent sx={{ textAlign: "center" }}>
            <ProfileImage
              src={userData.profileImage }
              alt="Profile"
            />
              <Box component="form">
                <TextField
                  fullWidth
                  label="Name"
                  value={userData.Username}
                  disabled={!editMode}
                  sx={{ mb: 2 }}
                  InputProps={{
                    "aria-label": "User name"
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={userData.Email}
                  disabled={!editMode}
                  onChange={handleEmailChange}
                  error={!validateEmail(userData.Email)}
                  helperText={!validateEmail(userData.Email) ? "Invalid email format" : ""}
                  sx={{ mb: 2 }}
                  InputProps={{
                    "aria-label": "User email"
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  value={userData.password}
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
                    "aria-label": "User password"
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

            <Typography variant="h5" sx={{ mb: 2 }}>
              Purchased Products
            </Typography>
            <Grid container spacing={2}>
              {purchasedProducts.map((product) => (
                <Grid item xs={12} sm={6} key={product.id}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`https://${product.image}`}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography color="text.secondary">{product.price}</Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Liked Products
            </Typography>
            <Grid container spacing={2}>
              {likedProducts.map((product) => (
                <Grid item xs={12} sm={6} key={product.id}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`https://${product.image}`}
                      alt={product.name}
                    />
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="h6">{product.name}</Typography>
                          <Typography color="text.secondary">{product.price}</Typography>
                        </Box>
                        <IconButton
                          onClick={() => handleUnlike(product.id)}
                          color="primary"
                          aria-label="Unlike product"
                        >
                          <FaHeart />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Add Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <AddProducts/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    <Footer/>
    </>
  );
};

export default Profile;