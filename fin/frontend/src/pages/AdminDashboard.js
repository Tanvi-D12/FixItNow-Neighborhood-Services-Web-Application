import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingProviders: 0,
    openDisputes: 0,
    adminUnreadCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/admin/login');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const providersRes = await apiService.getPendingProviders();
        const disputesRes = await apiService.getAdminDisputes();
        const adminUnreadRes = await apiService.getAdminUnreadCount();
        
        setStats({
          pendingProviders: providersRes.data?.length || 0,
          openDisputes: disputesRes.data?.filter(d => d.status === 'OPEN')?.length || 0,
          adminUnreadCount: adminUnreadRes.data?.unreadCount || 0
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading || loadingStats) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">FixItNow Admin Panel</h1>
            <p className="text-blue-100">Welcome, {user?.name || 'Admin'}</p>
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
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase">Pending Providers</h3>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pendingProviders}</p>
                <p className="text-gray-500 text-sm mt-2">Awaiting verification</p>
              </div>
              <div className="bg-orange-100 rounded-full p-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase">Open Disputes</h3>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.openDisputes}</p>
                <p className="text-gray-500 text-sm mt-2">Requiring resolution</p>
              </div>
              <div className="bg-red-100 rounded-full p-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* View Insights Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/insights')}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-4 rounded-lg transition duration-200 text-lg shadow-lg"
          >
            📊 View Insights
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Manage all users, providers, and admins. View details and delete accounts.
            </p>
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-200"
            >
              👥 Manage Users
            </button>
          </div>

          {/* Service Management */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Service Management</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Monitor all services on the platform. Deactivate or delete inappropriate services.
            </p>
            <button
              onClick={() => navigate('/admin/services')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition duration-200"
            >
              🔧 Manage Services
            </button>
          </div>

          {/* Provider Verification */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Provider Verification</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Review and verify pending providers. Approve or reject registrations.
            </p>
            <button
              onClick={() => navigate('/admin/providers')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition duration-200"
            >
              Manage Providers ({stats.pendingProviders})
            </button>
          </div>

          {/* Dispute Resolution */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Dispute Resolution</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Handle customer disputes and service complaints. Approve refunds.
            </p>
            <button
              onClick={() => navigate('/admin/disputes')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition duration-200"
            >
              Manage Disputes ({stats.openDisputes})
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Quick Tips</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ Review pending providers daily to ensure platform quality</li>
            <li>✓ Resolve disputes promptly to maintain customer satisfaction</li>
            <li>✓ Keep detailed notes on rejections for provider feedback</li>
            <li>✓ Monitor approval rates to identify trends</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
