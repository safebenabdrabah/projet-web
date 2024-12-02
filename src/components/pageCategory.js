import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../global/ProductContext';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import "../css/pageCategory.css";

function PageCategory() {
  const { categoryName } = useParams(); // Get the category from the URL params
  const { products, loading, error, fetchProducts } = useProducts(); // Access context

  const [sortBy, setSortBy] = useState("featured"); // Manage sort state locally
  const prevValues = useRef({ category: '', sortBy: '' });

  // Fetch products whenever the category or sortBy changes
  useEffect(() => {
    if (categoryName && (categoryName !== prevValues.current.category || sortBy !== prevValues.current.sortBy)) {
      fetchProducts(categoryName, sortBy); // Only fetch when category or sortBy changes
      prevValues.current = { category: categoryName, sortBy }; // Update ref values
    }
  }, [categoryName, sortBy, fetchProducts]);

  const handleSortChange = (newSortValue) => {
    setSortBy(newSortValue); // Update sort order
  };

  if (loading) return <div className="text-center text-gray-500">Loading products...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Category Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 capitalize">{categoryName}</h1>
          <p className="mt-2 text-lg text-gray-500">{products.length} products available</p>
        </div>

        {/* Sort and Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)} // Use local state update function
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">no filter</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="likes">likes </option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No products found in this category.</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PageCategory;
