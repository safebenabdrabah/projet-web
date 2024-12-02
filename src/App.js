import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AddProducts from './components/AddProducts';
import SignUp from './components/SignUp';
import { ToastContainer } from 'react-toastify';
import Profile from './components/Profile';
import { CartContextProvider } from './global/CartContext';
import CartProducts from './components/cartproducts';
import FirstPage from './components/FirstPage';
import SingleProduct from './components/SingleProduct';
import CheckoutPage from './components/Checkout';
import { UserProvider } from "./global/UserContext";
import { CartProvider } from './global/CartContext';
import { ProductProvider } from './global/ProductContext';
import PageCategory from './components/pageCategory';

function App() {
    
      return (
        <UserProvider>
          <CartProvider>
            <ProductProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route
                        path="/"
                        element={ <FirstPage/>}
                      />
                      <Route path="/addproducts" element={<AddProducts />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/cartproducts" element={<CartProducts />} />
                      <Route path="/product/:productId" element={<SingleProduct />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/category/:categoryName" element={<PageCategory />} />
                    </Routes>
                    <ToastContainer />
                  </BrowserRouter>
             </ProductProvider>
           </CartProvider>
        </UserProvider>
      );
    }

export default App;
