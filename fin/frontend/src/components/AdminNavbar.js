import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const AdminNavbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    adminUnreadCount: 0
  });

  // Fetch admin unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiService.getAdminUnreadCount();
        setStats({
          adminUnreadCount: response.data?.unreadCount || 0
        });
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    if (isAdmin()) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (!isAdmin()) {
    return null; // Don't render if not admin
  }

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/admin/dashboard" className="flex-shrink-0">
            <h1 className="text-2xl font-bold">FixItNow</h1>
          </Link>
          <div className="hidden md:flex md:space-x-6">
            <Link
              to="/admin/dashboard"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/providers"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Providers
            </Link>
            <Link
              to="/admin/users"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Users
            </Link>
            <Link
              to="/admin/services"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Services
            </Link>
            <Link
              to="/admin/disputes"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Disputes
            </Link>
            <Link
              to="/admin/insights"
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Insights
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/chat"
            className="relative inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
            {stats.adminUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {stats.adminUnreadCount > 99 ? '99+' : stats.adminUnreadCount}
              </span>
            )}
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-100">Welcome, {user?.name}</span>
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
