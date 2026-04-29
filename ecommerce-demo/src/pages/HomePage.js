import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.trackingSDK?.trackEvent('page_view', {
      page: 'home',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome to TechStore</h1>
        <p className="text-xl text-blue-100 mb-12">
          Discover premium tech products at unbeatable prices
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition font-bold text-lg"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HomePage;
