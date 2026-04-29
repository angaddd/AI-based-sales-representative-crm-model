import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-blue-600">Sales CRM</h1>
          <div className="flex space-x-6">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</a>
            <a href="/leads" className="text-gray-700 hover:text-blue-600 font-medium">Leads</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {user?.first_name} {user?.last_name}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
