import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PRODUCTS = [
  { id: 1, name: 'Laptop Pro', price: 1299, description: 'High-performance laptop for professionals', image: 'https://via.placeholder.com/300x200?text=Laptop' },
  { id: 2, name: 'Wireless Headphones', price: 199, description: 'Premium sound quality headphones', image: 'https://via.placeholder.com/300x200?text=Headphones' },
  { id: 3, name: 'USB-C Cable', price: 29, description: 'Fast charging and data transfer', image: 'https://via.placeholder.com/300x200?text=Cable' },
  { id: 4, name: 'Mechanical Keyboard', price: 149, description: 'RGB mechanical gaming keyboard', image: 'https://via.placeholder.com/300x200?text=Keyboard' },
  { id: 5, name: 'Monitor 4K', price: 499, description: 'UltraHD 4K display monitor', image: 'https://via.placeholder.com/300x200?text=Monitor' },
  { id: 6, name: 'USB Hub', price: 39, description: '7-port USB 3.0 hub', image: 'https://via.placeholder.com/300x200?text=Hub' },
];

const ProductListPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    // Track product view event
    window.trackingSDK?.trackEvent('view_product', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    
    // Track add to cart event
    window.trackingSDK?.trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });
  };

  useEffect(() => {
    window.trackingSDK?.trackEvent('page_view', {
      page: 'products',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
        <p className="text-gray-600 mb-8">Discover our collection of premium tech products</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover bg-gray-200"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
