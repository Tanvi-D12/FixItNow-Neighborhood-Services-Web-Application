import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bookingReviews, setBookingReviews] = useState({}); // Track which bookings have reviews
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportingBookingId, setReportingBookingId] = useState(null);
  const [reportForm, setReportForm] = useState({
    customerName: user?.name || '',
    customerContact: user?.phone || '',
    providerName: '',
    issueDetails: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const checkExistingReviews = async (bookingsList) => {
    if (user.role !== 'CUSTOMER') return;
    
    const reviewsMap = {};
    for (const booking of bookingsList) {
      if (booking.status === 'COMPLETED') {
        try {
          const response = await apiService.getBookingReview(booking.id);
          reviewsMap[booking.id] = response.data;
        } catch (error) {
          // No review exists for this booking, which is fine
          reviewsMap[booking.id] = null;
        }
      }
    }
    setBookingReviews(reviewsMap);
  };

  const fetchBookings = async () => {
    try {
      // Both customers and providers use the same endpoint - backend handles the role logic
      const response = await apiService.getProviderBookings(); // This actually calls /my-bookings
      
      console.log('Bookings API response:', response.data);
      
      // Handle paginated response - backend returns { content: [...], totalElements: X, ... }
      const bookingsData = response.data.content || response.data;
      console.log('Bookings data:', bookingsData);
      
      // Debug: Log the structure of the first booking
      if (bookingsData && bookingsData.length > 0) {
        console.log('First booking structure:', bookingsData[0]);
        console.log('Customer object:', bookingsData[0].customer);
        console.log('Provider object:', bookingsData[0].provider);
      }
      
      const finalBookings = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(finalBookings);
      
      // Check for existing reviews for completed bookings
      if (finalBookings.length > 0) {
        await checkExistingReviews(finalBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await apiService.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const booking = bookings.find(b => b.id === reportingBookingId);
      if (!booking) return;

      await apiService.reportDispute({
        bookingId: reportingBookingId,
        reporterId: user.id,
        description: reportForm.issueDetails
      });

      toast.success('Report submitted successfully. Admin will review it shortly.');
      setShowReportForm(false);
      setReportingBookingId(null);
      setReportForm({
        customerName: user?.name || '',
        customerContact: user?.phone || '',
        providerName: '',
        issueDetails: ''
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const openReportForm = (booking) => {
    setReportingBookingId(booking.id);
    
    // For providers reporting customers, show customer name
    // For customers reporting providers, show provider name
    const reportedPersonName = user.role === 'PROVIDER' 
      ? booking.customer?.name || 'Customer'
      : booking.provider?.name || booking.service?.provider?.name || 'Provider';
    
    setReportForm({
      customerName: user?.name || '',
      customerContact: user?.phone || '',
      providerName: reportedPersonName,
      issueDetails: ''
    });
    setShowReportForm(true);
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

  const getUrgencyColor = (urgency) => {
    const colors = {
      NORMAL: 'text-green-600',
      URGENT: 'text-orange-600',
      EMERGENCY: 'text-red-600'
    };
    return colors[urgency] || 'text-gray-600';
  };

  const getUrgencyDisplay = (urgency, booking) => {
    // Try to get urgency from the booking object first
    if (urgency) {
      const displays = {
        NORMAL: 'Normal',
        URGENT: 'Urgent (+50%)',
        EMERGENCY: 'Emergency (+100%)'
      };
      return displays[urgency] || urgency;
    }
    
    // If not available, try to extract from notes
    if (booking.notes || booking.specialRequests) {
      const notes = booking.notes || booking.specialRequests || '';
      if (notes.includes('URGENT')) return 'Urgent (+50%)';
      if (notes.includes('EMERGENCY')) return 'Emergency (+100%)';
      if (notes.includes('NORMAL')) return 'Normal';
    }
    
    return 'Normal';
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'ALL') return true;
    return booking.status === statusFilter;
  });

  // Indian currency formatter
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Invalid Time';
    try {
      // Handle different time formats
      let timeToFormat;
      if (timeString.includes('T')) {
        // ISO datetime format
        timeToFormat = new Date(timeString);
      } else if (timeString.includes(':')) {
        // Time only format like "14:30:00" or "14:30"
        timeToFormat = new Date(`2000-01-01T${timeString}`);
      } else {
        return timeString; // Return as-is if format is unclear
      }
      
      if (isNaN(timeToFormat.getTime())) return 'Invalid Time';
      
      return timeToFormat.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {user.role === 'PROVIDER' ? 'Service Requests' : 'My Bookings'}
        </h1>
        
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-gray-500">
            {statusFilter === 'ALL' 
              ? "You don't have any bookings yet." 
              : `No bookings with status "${statusFilter}".`
            }
          </p>
          {user.role === 'CUSTOMER' && (
            <Link
              to="/services-map"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.serviceTitle}
                  </h3>
                  <p className="text-gray-600">
                    {user.role === 'PROVIDER' 
                      ? `Customer: ${booking.customer?.name || 'Unknown'}` 
                      : `Provider: ${booking.provider?.name || booking.service?.provider?.name || 'Unknown'}`
                    }
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                    </svg>
                    <span>Booking ID: #{booking.id}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {formatCurrency(booking.totalAmount || (booking.service?.price * (booking.duration || 1)))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-gray-900">
                    {formatDate(booking.bookingDate || booking.scheduledDate)} at {formatTime(booking.timeSlot || booking.scheduledTime)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Duration</p>
                  <p className="text-gray-900">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Urgency</p>
                  <p className={`font-medium ${getUrgencyColor(booking.urgencyLevel)}`}>
                    {getUrgencyDisplay(booking.urgencyLevel, booking)}
                  </p>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Special Requests</p>
                  <p className="text-gray-900 text-sm mt-1">{booking.specialRequests}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Created: {formatDate(booking.createdAt)}
                </div>
                
                <div className="flex space-x-2">
                  {user.role === 'PROVIDER' && booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {user.role === 'PROVIDER' && booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  {user.role === 'CUSTOMER' && booking.status === 'PENDING' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {booking.status === 'COMPLETED' && user.role === 'CUSTOMER' && (
                    bookingReviews[booking.id] ? (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm cursor-not-allowed"
                        disabled
                      >
                        ✓ Reviewed
                      </button>
                    ) : (
                      <Link
                        to={`/review/${booking.id}`}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                      >
                        Leave Review
                      </Link>
                    )
                  )}
                  
                  <Link
                    to={`/chat/${user.role === 'PROVIDER' ? booking.customer?.id || booking.customerId : booking.provider?.id || booking.service?.provider?.id || booking.providerId}`}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Message
                  </Link>
                  
                  {(user.role === 'CUSTOMER' || user.role === 'PROVIDER') && (
                    <button
                      onClick={() => openReportForm(booking)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Report Issue
                    </button>
                  )}
                  
                  <Link
                    to={`/booking-confirmation/${booking.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Issue</h2>
            
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={reportForm.customerName}
                  onChange={(e) => setReportForm({...reportForm, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Contact Number</label>
                <input
                  type="tel"
                  value={reportForm.customerContact}
                  onChange={(e) => setReportForm({...reportForm, customerContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {user.role === 'PROVIDER' ? 'Customer Name' : 'Provider Name'}
                </label>
                <input
                  type="text"
                  value={reportForm.providerName}
                  onChange={(e) => setReportForm({...reportForm, providerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Details</label>
                <textarea
                  value={reportForm.issueDetails}
                  onChange={(e) => setReportForm({...reportForm, issueDetails: e.target.value})}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="5"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm(false);
                    setReportingBookingId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;