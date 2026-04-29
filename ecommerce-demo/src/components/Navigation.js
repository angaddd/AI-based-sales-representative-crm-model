import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navigation = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-blue-600 hover:text-blue-700"
        >
          TechStore
        </button>
        
        <div className="flex items-center space-x-8">
          <button
            onClick={() => navigate('/products')}
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Products
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="relative text-gray-700 hover:text-blue-600 font-medium"
          >
            Cart
            {getTotalItems() > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
