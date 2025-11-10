import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const MyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(true);

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const response = await apiService.getProviderServices();
      console.log('My Services API response:', response.data);
      
      // Handle paginated response - backend returns { content: [...], totalElements: X, ... }
      const servicesData = response.data.content || response.data;
      console.log('Services data:', servicesData);
      
      // Debug: Log each service's status fields
      if (Array.isArray(servicesData)) {
        servicesData.forEach((service, index) => {
          console.log(`Service ${index + 1} (ID: ${service.id}):`, {
            title: service.title,
            active: service.active,
            isActive: service.isActive,
            // Check all possible status field variations
            status: service.status,
            enabled: service.enabled
          });
        });
      }
      
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    // Ensure we have a valid boolean value
    const currentStatusBool = Boolean(currentStatus);
    const newStatus = !currentStatusBool;
    const actionText = newStatus ? 'activate' : 'deactivate';
    const serviceName = services.find(s => s.id === serviceId)?.title || 'this service';
    
    console.log('DEBUG: Toggle service status called', {
      serviceId,
      currentStatus,
      currentStatusBool,
      newStatus,
      actionText
    });
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${serviceName}"?\n\n${
        newStatus 
          ? 'Activating will make this service visible to customers and available for booking.' 
          : 'Deactivating will hide this service from customers and prevent new bookings.'
      }`
    );
    
    if (!confirmed) {
      console.log('DEBUG: User cancelled the action');
      return;
    }
    
    let loadingToast;
    try {
      // Show loading toast
      loadingToast = toast.loading(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing service...`);
      
      console.log(`DEBUG: Toggling service ${serviceId} from ${currentStatusBool} to ${newStatus}`);
      
      const response = await apiService.updateServiceStatus(serviceId, newStatus);
      console.log('DEBUG: Status update response:', response);
      console.log('DEBUG: Response data:', response.data);
      
      // Dismiss loading toast first
      toast.dismiss(loadingToast);
      
      // Show success message
      toast.success(`Service ${actionText}d successfully! ${
        newStatus 
          ? 'Your service is now visible to customers.' 
          : 'Your service is now hidden from customers.'
      }`, {
        icon: newStatus ? '✅' : '⏸️',
        duration: 4000
      });
      
      // Refresh the services list from server to ensure consistency
      console.log('DEBUG: Refreshing services list from server...');
      await fetchMyServices();
      
    } catch (error) {
      console.error('ERROR: Failed to update service status:', error);
      console.error('ERROR: Error response status:', error.response?.status);
      console.error('ERROR: Error response data:', error.response?.data);
      console.error('ERROR: Error message:', error.message);
      
      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      // Show specific error message
      let errorMessage = 'Failed to update service status';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
        // Optionally redirect to login
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this service.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Service not found.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(`Failed to ${actionText} service: ${errorMessage}`, {
        duration: 6000
      });
    }
  };

  const deleteService = async (serviceId) => {
    const serviceName = services.find(s => s.id === serviceId)?.title || 'this service';
    
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting service...');
    
    try {
      await apiService.deleteService(serviceId);
      
      toast.dismiss(loadingToast);
      toast.success('Service permanently deleted!', {
        icon: '🗑️',
        duration: 3000
      });
      
      // Remove the service from local state immediately for better UX
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      // Also refresh from server to ensure consistency
      await fetchMyServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.dismiss(loadingToast);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to delete service';
      
      toast.error(`Failed to delete service: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper function to get consistent service status
  const getServiceStatus = (service) => {
    // Priority: isActive field first (backend primary field), then active field (JSON alias)
    if (service.isActive !== undefined && service.isActive !== null) {
      return Boolean(service.isActive);
    }
    if (service.active !== undefined && service.active !== null) {
      return Boolean(service.active);
    }
    return false; // Default to inactive if no status field found
  };

  // Filter services based on showInactive toggle
  const filteredServices = services.filter(service => {
    const isActive = getServiceStatus(service);
    return showInactive ? true : isActive;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">
            Manage your services and their availability ({services.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show inactive services</span>
            </label>
          </div>
          <Link
            to="/create-service"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Service
          </Link>
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {services.length === 0 ? 'No services yet' : 'No services to display'}
          </h3>
          <p className="mt-2 text-gray-500">
            {services.length === 0 
              ? 'Get started by creating your first service.'
              : showInactive 
                ? 'No services match the current filter.'
                : 'All your services are inactive. Enable "Show inactive services" to see them.'
            }
          </p>
          <Link
            to="/create-service"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getServiceStatus(service)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${
                        getServiceStatus(service)
                          ? 'bg-green-400' 
                          : 'bg-red-400'
                      }`}></span>
                      {getServiceStatus(service) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {service.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Subcategory:</span> {service.subcategory}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ₹{service.price}/hour
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {service.location}
                  </p>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>0.0 (0 reviews)</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/edit-service/${service.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center"
                  >
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => toggleServiceStatus(service.id, getServiceStatus(service))}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                      getServiceStatus(service)
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                    }`}
                    title={`Click to ${getServiceStatus(service) ? 'deactivate' : 'activate'} this service`}
                  >
                    {getServiceStatus(service) ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-6-2a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        Activate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => deleteService(service.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;