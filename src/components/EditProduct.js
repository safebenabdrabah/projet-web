import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/Config';
import { Button, TextField, Container, Typography, Snackbar, Alert } from '@mui/material'

const EditProduct = () => {
    const [product, setProduct] = useState(null);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productImages, setProductImages] = useState([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();
    const { productId } = useParams(); // Get the productId from the URL
  
    // Fetch product data when the component mounts
    useEffect(() => {
      const fetchProductData = async () => {
        try {
          const docRef = doc(db, 'products', productId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProduct(data);
            setProductName(data.productName);
            setProductPrice(data.productPrice);
            setProductDescription(data.description);
            setProductCategory(data.category);
            setProductImages(data.images);
          } else {
            setToastMessage('Product not found.');
            setToastOpen(true);
            navigate('/'); // Redirect if product is not found
          }
        } catch (error) {
          setToastMessage('Error fetching product data.');
          setToastOpen(true);
        }
      };
  
      fetchProductData();
    }, [productId, navigate]);
  
    // Handle the form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!productName || !productPrice || !productDescription || !productCategory) {
        setToastMessage('All fields are required.');
        setToastOpen(true);
        return;
      }
  
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          productName,
          productPrice: parseFloat(productPrice),
          description: productDescription,
          category: productCategory,
          images: productImages, // Assuming images are handled elsewhere
        });
  
        setToastMessage('Product updated successfully.');
        setToastOpen(true);
        navigate(`/product/${productId}`); // Redirect to product page
      } catch (error) {
        setToastMessage('Error updating product.');
        setToastOpen(true);
      }
    };
  
    if (!product) {
      return <Typography>Loading...</Typography>; // Loading state while fetching product data
    }
  
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Product
        </Typography>
  
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Product Price"
            type="number"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Product Description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Product Category"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            margin="normal"
          />
          {/* Optionally, add image upload/input here if needed */}
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            Update Product
          </Button>
        </form>
  
        {/* Toast Snackbar */}
        <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
          <Alert severity="success">{toastMessage}</Alert>
        </Snackbar>
      </Container>
    );
  };
  
  export default EditProduct;
  