import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PRODUCTS = {
  1: { id: 1, name: 'Laptop Pro', price: 1299, description: 'High-performance laptop for professionals', image: 'https://via.placeholder.com/500x300?text=Laptop', specs: ['Intel i7', '16GB RAM', '512GB SSD', '15.6" Display'] },
  2: { id: 2, name: 'Wireless Headphones', price: 199, description: 'Premium sound quality headphones', image: 'https://via.placeholder.com/500x300?text=Headphones', specs: ['40hr Battery', 'Active Noise Cancellation', 'Foldable', 'Wireless'] },
  3: { id: 3, name: 'USB-C Cable', price: 29, description: 'Fast charging and data transfer', image: 'https://via.placeholder.com/500x300?text=Cable', specs: ['2m Length', '480Mbps', 'Fast Charging', 'Durable'] },
  4: { id: 4, name: 'Mechanical Keyboard', price: 149, description: 'RGB mechanical gaming keyboard', image: 'https://via.placeholder.com/500x300?text=Keyboard', specs: ['RGB LED', 'Mechanical Switches', 'Programmable', 'USB-C'] },
  5: { id: 5, name: 'Monitor 4K', price: 499, description: 'UltraHD 4K display monitor', image: 'https://via.placeholder.com/500x300?text=Monitor', specs: ['3840x2160', '60Hz', 'HDR10', 'USB-C'] },
  6: { id: 6, name: 'USB Hub', price: 39, description: '7-port USB 3.0 hub', image: 'https://via.placeholder.com/500x300?text=Hub', specs: ['7 Ports', 'USB 3.0', 'Powered', 'Aluminum'] },
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = PRODUCTS[id];
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      window.trackingSDK?.trackEvent('view_product', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        page_depth: 2,
      });
    }
  }, [id, product]);

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  const handleAddToCart = () => {
    addToCart(product);
    window.trackingSDK?.trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/products')}
          className="text-blue-600 hover:text-blue-800 mb-8 font-medium"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover bg-gray-200 rounded-lg"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <ul className="space-y-2">
                  {product.specs.map((spec, index) => (
                    <li key={index} className="text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <p className="text-4xl font-bold text-blue-600 mb-6">${product.price}</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product);
                      window.trackingSDK?.trackEvent('start_checkout', {
                        product_id: product.id,
                        product_name: product.name,
                        price: product.price,
                      });
                      navigate('/cart');
                    }}
                    className="flex-1 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
