import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import '../css/Home.css'
import NewsAndPromotions from "./NewsAndPromotions";
import ProductCategories from "./ProductCategories";
import MostLikedProducts from "./MostLikedProducts";
import Footer from "./Footer";


function Home (){
    return(

      <div className="wrapper">
         <>
         <Navbar />
         <NewsAndPromotions />
         <ProductCategories />
         <MostLikedProducts />
         <Footer />
         </>
       </div>
    );
  }
export default Home ; 