import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/productsCategories.css";
import electronicsImage from "../images/Electronics.png";
import fashionImage from "../images/Fashion.png";
import homeImage from "../images/Home.png";

function ProductCategories() {
  const navigate = useNavigate();
   

  const categories = [
    { name: "Electronics", link: "/category/electronics", image: electronicsImage },
    { name: "Fashion", link: "/category/fashion", image: fashionImage },
    { name: "Home", link: "/category/home", image: homeImage },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName.toLowerCase()}`); 
  };

  return (
    <div className="product-categories">
      <div className="categories-list">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)} // Pass category name here
            style={{ cursor: "pointer" }}
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
            <h3 className="category-name">{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCategories;
