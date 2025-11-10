import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, canCreateServices, isProvider } = useAuth();
  const { totalUnreadCount, toggleChat } = useChat();
  const navigate = useNavigate();

  const getAvatarUrl = (avatarPath) => {
    console.log('DEBUG: getAvatarUrl called with:', avatarPath);
    if (!avatarPath) {
      console.log('DEBUG: No avatar path, using default');
      return '/default-avatar.svg';
    }
    if (avatarPath.startsWith('http')) {
      console.log('DEBUG: Avatar path is already full URL:', avatarPath);
      return avatarPath;
    }
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const fullUrl = `${apiBase}${avatarPath}`;
    console.log('DEBUG: Avatar path:', avatarPath, '-> Full URL:', fullUrl);
    return fullUrl;
  };

  console.log('DEBUG: Navbar rendering with user:', user ? { id: user.id, name: user.name, profileImage: user.profileImage, avatarUrl: user.avatarUrl } : 'no user');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">⚒️FixItNow</h1>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              {isProvider() && (
                <Link
                  to="/my-services"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Services
                </Link>
              )}
              {!isProvider() && (
                <Link
                  to="/services-map"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Services
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {canCreateServices() && (
                  <Link
                    to="/create-service"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    + Create Service
                  </Link>
                )}
                <button
                  onClick={toggleChat}
                  className="relative text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm text-gray-900 font-medium">{user.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      isProvider() ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className="relative group"
                    title="View Profile"
                  >
                    <img
                      src={getAvatarUrl(user.profileImage || user.avatarUrl)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-primary-600 transition-all"
                      onLoad={() => console.log('DEBUG: Avatar image loaded successfully')}
                      onError={(e) => {
                        console.error('DEBUG: Avatar image failed to load. Src was:', e.target.src);
                        e.target.src = '/default-avatar.svg';
                      }}
                    />
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;