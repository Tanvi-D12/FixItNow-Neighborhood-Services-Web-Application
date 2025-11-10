import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const CreateReview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    serviceQuality: 5,
    communication: 5,
    punctuality: 5,
    value: 5
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await apiService.getBookingById(bookingId);
      const bookingData = response.data;
      
      // Let the backend handle the validation to avoid duplicate error messages
      
      if (bookingData.status !== 'COMPLETED') {
        toast.error('You can only review completed bookings');
        navigate('/bookings');
        return;
      }
      
      setBooking(bookingData);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (field, rating) => {
    setReviewData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleCommentChange = (e) => {
    setReviewData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  const calculateOverallRating = () => {
    const { serviceQuality, communication, punctuality, value } = reviewData;
    return Math.round((serviceQuality + communication + punctuality + value) / 4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const providerId = booking.provider?.id || booking.providerId || booking.service?.provider?.id;
      const reviewPayload = {
        bookingId: parseInt(bookingId),
        customerId: user.id,
        providerId: providerId,
        rating: calculateOverallRating(),
        comment: reviewData.comment,
        serviceQuality: reviewData.serviceQuality,
        communication: reviewData.communication,
        punctuality: reviewData.punctuality,
        value: reviewData.value
      };

      await apiService.createReview(reviewPayload);
      toast.success('Review submitted successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 w-24">{label}:</span>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`w-6 h-6 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-gray-600">{rating}/5</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-gray-600 mt-2">The booking you're trying to review doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leave a Review</h1>
        
        {/* Booking Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Service</p>
              <p className="text-gray-900">{booking.service?.title || booking.serviceTitle || 'Service'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Provider</p>
              <p className="text-gray-900">{booking.provider?.name || booking.providerName || 'Provider'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Date</p>
              <p className="text-gray-900">
                {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                {new Date(`2000-01-01T${booking.scheduledTime}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Paid</p>
              <p className="text-gray-900 font-semibold">₹{booking.service?.price || booking.totalAmount || 0}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Detailed Ratings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rate Your Experience</h3>
            <div className="space-y-4">
              <StarRating
                rating={reviewData.serviceQuality}
                onRatingChange={(rating) => handleRatingChange('serviceQuality', rating)}
                label="Service Quality"
              />
              <StarRating
                rating={reviewData.communication}
                onRatingChange={(rating) => handleRatingChange('communication', rating)}
                label="Communication"
              />
              <StarRating
                rating={reviewData.punctuality}
                onRatingChange={(rating) => handleRatingChange('punctuality', rating)}
                label="Punctuality"
              />
              <StarRating
                rating={reviewData.value}
                onRatingChange={(rating) => handleRatingChange('value', rating)}
                label="Value for Money"
              />
            </div>
          </div>

          {/* Overall Rating Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Overall Rating:</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-8 h-8 ${
                      star <= calculateOverallRating() ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-xl font-bold text-gray-900">
                  {calculateOverallRating()}/5
                </span>
              </div>
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Your Experience
            </label>
            <textarea
              value={reviewData.comment}
              onChange={handleCommentChange}
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell others about your experience with this service provider. What did they do well? Any areas for improvement?"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your review helps other customers make informed decisions and helps providers improve their services.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReview;