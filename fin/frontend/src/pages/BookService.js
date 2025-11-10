import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    selectedTime: '',
    duration: 1,
    specialRequests: '',
    urgencyLevel: 'NORMAL'
  });

  const fetchService = useCallback(async () => {
    try {
      const response = await apiService.getServiceById(serviceId);
      setService(response.data);
      
      // Fetch review stats for the provider
      try {
        const reviewResponse = await apiService.getProviderReviewStats(response.data.provider?.id || response.data.providerId);
        setReviewStats({
          averageRating: reviewResponse.data.averageRating || 0,
          totalReviews: reviewResponse.data.totalReviews || 0
        });
      } catch (reviewError) {
        console.error('Error fetching review stats:', reviewError);
        // Keep default values if review stats fail
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service details');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  }, [serviceId, navigate]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const getAvailableTimeSlots = () => {
    if (!service || !bookingData.selectedDate) return [];

    // Generate default time slots if availability is not properly defined
    if (!service.availability) {
      const slots = [];
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }

    try {
      // Parse availability if it's a JSON string
      let availability = service.availability;
      if (typeof availability === 'string') {
        availability = JSON.parse(availability);
      }

      const selectedDay = new Date(bookingData.selectedDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
      const dayAvailability = availability[selectedDay];

      if (!dayAvailability || !dayAvailability.available) {
        return [];
      }

      const slots = [];
      const startTime = new Date(`2000-01-01T${dayAvailability.start}:00`);
      const endTime = new Date(`2000-01-01T${dayAvailability.end}:00`);
      
      while (startTime < endTime) {
        slots.push(startTime.toTimeString().slice(0, 5));
        startTime.setMinutes(startTime.getMinutes() + 60); // 1-hour slots
      }

      return slots;
    } catch (error) {
      console.error('Error parsing availability:', error);
      // Fallback to default slots
      const slots = [];
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }
  };

  const calculateTotal = () => {
    if (!service) return 0;
    let basePrice = service.price * bookingData.duration;
    
    // Add urgency surcharge
    if (bookingData.urgencyLevel === 'URGENT') {
      basePrice *= 1.5; // 50% surcharge for urgent
    } else if (bookingData.urgencyLevel === 'EMERGENCY') {
      basePrice *= 2; // 100% surcharge for emergency
    }
    
    return basePrice.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingData.selectedDate) {
      toast.error('Please select a date');
      return;
    }
    
    if (!bookingData.selectedTime) {
      toast.error('Please select a time slot');
      return;
    }
    
    if (!bookingData.duration || bookingData.duration < 1) {
      toast.error('Please select a valid duration');
      return;
    }
    
    // Check if selected date is not in the past
    const selectedDate = new Date(bookingData.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    setBookingLoading(true);

    try {
      const bookingPayload = {
        serviceId: parseInt(serviceId),
        bookingDate: bookingData.selectedDate,
        timeSlot: bookingData.selectedTime,
        urgencyLevel: bookingData.urgencyLevel,
        notes: `Duration: ${bookingData.duration} hours, Urgency: ${bookingData.urgencyLevel}, Total: ₹${calculateTotal()}${bookingData.specialRequests ? `, Special Requests: ${bookingData.specialRequests.trim()}` : ''}`
      };

      console.log('Creating booking with payload:', bookingPayload);
      const response = await apiService.createBooking(bookingPayload);
      toast.success('Booking created successfully!');
      navigate(`/booking-confirmation/${response.data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid booking data');
      } else if (error.response?.status === 409) {
        toast.error('Time slot is no longer available');
      } else {
        toast.error('Failed to create booking. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Service Not Found</h2>
        <p className="text-gray-600 mt-2">The service you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Service Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              <p className="text-gray-600 mt-1">by {service.providerName}</p>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-blue-600">₹{service.price}</span>
                <span className="text-gray-600 ml-1">/hour</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">{service.category} {' > '} {service.subcategory}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-gray-600">
                  {reviewStats.totalReviews > 0 
                    ? `${reviewStats.averageRating.toFixed(1)} (${reviewStats.totalReviews} review${reviewStats.totalReviews !== 1 ? 's' : ''})`
                    : 'No reviews yet'
                  }
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{service.location}</p>
            </div>
          </div>
          <p className="text-gray-700 mt-4">{service.description}</p>
        </div>

        {/* Booking Form */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Book This Service</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <input
                  type="date"
                  name="selectedDate"
                  value={bookingData.selectedDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time *
                </label>
                <select
                  name="selectedTime"
                  value={bookingData.selectedTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose time slot</option>
                  {getAvailableTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {bookingData.selectedDate && getAvailableTimeSlots().length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Provider is not available on this day</p>
                )}
              </div>
            </div>

            {/* Duration and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours) *
                </label>
                <select
                  name="duration"
                  value={bookingData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(hour => (
                    <option key={hour} value={hour}>{hour} hour{hour > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgencyLevel"
                  value={bookingData.urgencyLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NORMAL">Normal (No extra charge)</option>
                  <option value="URGENT">Urgent (+50% surcharge)</option>
                  <option value="EMERGENCY">Emergency (+100% surcharge)</option>
                </select>
                <div className="text-sm text-gray-500 mt-1">
                  Current selection: {bookingData.urgencyLevel} 
                  {bookingData.urgencyLevel === 'URGENT' && ' (+50%)'}
                  {bookingData.urgencyLevel === 'EMERGENCY' && ' (+100%)'}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests or Instructions
              </label>
              <textarea
                name="specialRequests"
                value={bookingData.specialRequests}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special instructions or requirements..."
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Rate ({bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''})</span>
                  <span>₹{(service.price * bookingData.duration).toFixed(2)}</span>
                </div>
                {bookingData.urgencyLevel !== 'NORMAL' && (
                  <div className="flex justify-between text-orange-600">
                    <span>{bookingData.urgencyLevel.charAt(0) + bookingData.urgencyLevel.slice(1).toLowerCase()} Surcharge</span>
                    <span>+₹{((service.price * bookingData.duration) * (bookingData.urgencyLevel === 'URGENT' ? 0.5 : 1)).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{calculateTotal()}</span>
                </div>
                {bookingData.urgencyLevel !== 'NORMAL' && (
                  <div className="text-sm text-gray-600">
                    Includes {bookingData.urgencyLevel === 'URGENT' ? '50%' : '100%'} {bookingData.urgencyLevel.toLowerCase()} surcharge
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/service/${serviceId}`)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={bookingLoading || !bookingData.selectedDate || !bookingData.selectedTime}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookService;