import React, { useEffect, useRef, useState } from 'react';
import googleMapsService from '../services/googleMapsService';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MapView = ({ 
  services = [], 
  onServiceSelect, 
  showUserLocation = true, 
  height = '600px',
  className = '',
  searchLocation = null,
  onBoundsChange = null
}) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!mapRef.current) {
          return;
        }

        // Check if Google Maps API key is configured
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
          console.warn('Google Maps API key not configured properly');
          setError('Google Maps API key not configured. Please contact administrator.');
          setIsLoading(false);
          return;
        }

        // Initialize the map
        await googleMapsService.initMap(mapRef.current);

        // Get user location if requested
        if (showUserLocation) {
          try {
            const location = await googleMapsService.getCurrentLocation();
            setUserLocation(location);
            googleMapsService.addUserLocationMarker(location);
            googleMapsService.centerMap(location, 14);
          } catch (locationError) {
            console.warn('Could not get user location:', locationError);
            // Continue without user location
          }
        }

        // Set up bounds change listener for loading services dynamically
        if (onBoundsChange && googleMapsService.map) {
          googleMapsService.map.addListener('bounds_changed', () => {
            const bounds = googleMapsService.getMapBounds();
            if (bounds) {
              onBoundsChange(bounds);
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Map service is temporarily unavailable. Please try refreshing the page.');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      googleMapsService.clearServiceMarkers();
    };
  }, [showUserLocation, onBoundsChange]);

  // Update service markers when services change
  useEffect(() => {
    if (!isLoading && !error && services.length > 0) {
      const handleServiceClick = (service) => {
        if (onServiceSelect) {
          onServiceSelect(service);
        } else {
          navigate(`/services/${service.id}`);
        }
      };

      googleMapsService.addServiceMarkers(services, handleServiceClick);
      
      // Fit map to show all markers
      setTimeout(() => {
        googleMapsService.fitBounds(showUserLocation);
      }, 100);
    }
  }, [services, isLoading, error, onServiceSelect, navigate, showUserLocation]);

  // Handle search location changes
  useEffect(() => {
    if (searchLocation && !isLoading && !error) {
      googleMapsService.centerMap(searchLocation, 14);
    }
  }, [searchLocation, isLoading, error]);

  if (error) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 text-center ${className}`} style={{ height }}>
        <div className="text-blue-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-blue-800 mb-3">Interactive Map Coming Soon!</h3>
        <p className="text-blue-700 mb-4">The map feature requires Google Maps API configuration.</p>
        
        {/* Service List as fallback */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">Available Services</h4>
          {services.length === 0 ? (
            <p className="text-blue-600">No services available at the moment.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {services.slice(0, 5).map((service, index) => (
                <div key={index} className="bg-white p-3 rounded border text-left">
                  <h5 className="font-medium text-gray-900">{service.title}</h5>
                  <p className="text-sm text-gray-600">{service.location}</p>
                  <p className="text-sm font-semibold text-blue-600">₹{service.price}/hour</p>
                </div>
              ))}
              {services.length > 5 && (
                <p className="text-sm text-blue-600">...and {services.length - 5} more services</p>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-blue-600 bg-blue-100 p-3 rounded">
          <p className="font-semibold mb-1">To enable full map functionality:</p>
          <p>1. Get Google Maps API key from Google Cloud Console</p>
          <p>2. Add it to your .env file as REACT_APP_GOOGLE_MAPS_API_KEY</p>
          <p>3. Restart the development server</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Map controls overlay */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
          <div className="flex flex-col space-y-2">
            {/* Service count */}
            <div className="text-sm text-gray-600 px-2">
              {services.length} service{services.length !== 1 ? 's' : ''} shown
            </div>
            
            {/* User location button */}
            {showUserLocation && (
              <button
                onClick={async () => {
                  try {
                    const location = await googleMapsService.getCurrentLocation();
                    setUserLocation(location);
                    googleMapsService.addUserLocationMarker(location);
                    googleMapsService.centerMap(location, 14);
                    toast.success('Centered on your location');
                  } catch (err) {
                    toast.error('Could not get your location');
                  }
                }}
                className="p-2 hover:bg-gray-50 rounded text-gray-600 hover:text-blue-600 transition-colors"
                title="Center on my location"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            
            {/* Fit all markers button */}
            {services.length > 0 && (
              <button
                onClick={() => googleMapsService.fitBounds(showUserLocation)}
                className="p-2 hover:bg-gray-50 rounded text-gray-600 hover:text-blue-600 transition-colors"
                title="Show all services"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;