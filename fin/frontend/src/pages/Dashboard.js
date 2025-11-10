import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      let statsResponse, bookingsResponse;
      
      if (user.role === 'PROVIDER') {
        statsResponse = await apiService.getProviderStats(user.id);
        bookingsResponse = await apiService.getProviderBookings(5); // Last 5 bookings
      } else {
        statsResponse = await apiService.getCustomerStats(user.id);
        bookingsResponse = await apiService.getCustomerBookings(user.id, 5); // Last 5 bookings
      }
      
      setStats(statsResponse.data || {});
      setRecentBookings(bookingsResponse.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default stats if API fails
      setStats({
        pendingBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        avgRating: 0,
        totalServices: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderCustomerDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user.name}!</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Services</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalSpent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Given</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.reviewsGiven || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/services-map" className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors">
              Browse Services
            </Link>
            <Link to="/bookings" className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition-colors">
              View My Bookings
            </Link>
            <Link to="/profile" className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition-colors">
              Update Profile
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Find trusted service providers in your area for all your home repair and maintenance needs.
            </p>
            <Link to="/help" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProviderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Provider Dashboard - {user.name}</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Completed Jobs</h3>
          <p className="text-3xl font-bold text-secondary-600">{stats.completedBookings || 0}</p>
          <p className="text-gray-600">Total completed</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</p>
          <p className="text-gray-600">⭐⭐⭐⭐⭐</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
          <div className="card">
            <p className="text-gray-600 text-center py-8">No bookings yet.</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Services</h3>
          <div className="card">
            <p className="text-gray-600 text-center py-4">No services listed yet.</p>
            <button className="btn-primary w-full mt-4">Add Service</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
          <p className="text-gray-600">Registered users</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Service Providers</h3>
          <p className="text-3xl font-bold text-secondary-600">0</p>
          <p className="text-gray-600">Active providers</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
          <p className="text-gray-600">All time</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Pending Verifications</h3>
          <p className="text-3xl font-bold text-red-600">0</p>
          <p className="text-gray-600">Need review</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="btn-primary">Verify Providers</button>
          <button className="btn-secondary">View Reports</button>
          <button className="btn-outline">System Settings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your account
        </p>
      </div>

      {user?.role === 'CUSTOMER' && renderCustomerDashboard()}
      {user?.role === 'PROVIDER' && renderProviderDashboard()}
      {user?.role === 'ADMIN' && renderAdminDashboard()}
    </div>
  );
};

export default Dashboard;