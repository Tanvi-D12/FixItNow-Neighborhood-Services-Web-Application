import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminInsights = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/admin/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const exportToCSV = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Prepare data for CSV
      const csvData = [];
      
      // Add metrics
      csvData.push(['Analytics Report', timestamp]);
      csvData.push([]);
      csvData.push(['KEY METRICS']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Bookings', analytics.metrics?.totalBookings || 0]);
      csvData.push(['Total Revenue', analytics.metrics?.totalRevenue || 0]);
      csvData.push(['Active Services', analytics.metrics?.activeServices || 0]);
      csvData.push(['Average Rating', analytics.metrics?.avgRating?.toFixed(2) || 'N/A']);
      
      csvData.push([]);
      csvData.push(['TOP SERVICES']);
      csvData.push(['Service Title', 'Booking Count']);
      (analytics.topServices || []).forEach(service => {
        csvData.push([service.title, service.bookingCount]);
      });
      
      csvData.push([]);
      csvData.push(['TOP PROVIDERS']);
      csvData.push(['Provider Name', 'Rating', 'Bookings', 'Total Earnings']);
      (analytics.topProviders || []).forEach(provider => {
        csvData.push([provider.name, provider.avgRating.toFixed(2), provider.bookingCount, provider.totalEarnings]);
      });
      
      csvData.push([]);
      csvData.push(['LOCATION TRENDS']);
      csvData.push(['Location', 'Booking Count']);
      (analytics.locationTrends || []).forEach(location => {
        csvData.push([location.location, location.bookingCount]);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
      
      // Download
      XLSX.writeFile(wb, `Analytics_Report_${timestamp}.xlsx`);
      toast.success('Analytics exported to Excel!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-700 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">FixItNow Admin</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hover:bg-blue-600 px-4 py-2 rounded transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-700 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">FixItNow Admin</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hover:bg-blue-600 px-4 py-2 rounded transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 text-lg">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FixItNow Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="hover:bg-blue-600 px-4 py-2 rounded transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="hover:bg-red-600 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h2>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
            >
              📥 Export to Excel
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm uppercase font-semibold">Total Bookings</div>
            <div className="text-4xl font-bold text-blue-600 mt-2">
              {analytics.metrics?.totalBookings || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm uppercase font-semibold">Total Revenue</div>
            <div className="text-4xl font-bold text-green-600 mt-2">
              ₹{(analytics.metrics?.totalRevenue || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm uppercase font-semibold">Active Services</div>
            <div className="text-4xl font-bold text-purple-600 mt-2">
              {analytics.metrics?.activeServices || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm uppercase font-semibold">Avg Rating</div>
            <div className="text-4xl font-bold text-yellow-600 mt-2">
              {analytics.metrics?.avgRating ? analytics.metrics.avgRating.toFixed(2) : 'N/A'} ★
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🏆 Most Booked Services</h3>
          {(analytics.topServices || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topServices || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} bookings`, 'Count']}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="bookingCount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">No service data available</div>
          )}
        </div>

        {/* Top Providers */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">⭐ Top Providers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provider</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {(analytics.topProviders || []).map((provider, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">{provider.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {provider.avgRating.toFixed(2)} ★
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{provider.bookingCount}</td>
                    <td className="py-3 px-4 text-green-600 font-bold">
                      ₹{provider.totalEarnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📍 Location Trends</h3>
          {(analytics.locationTrends || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.locationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} bookings`, 'Count']}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bookingCount" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">No location data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;
