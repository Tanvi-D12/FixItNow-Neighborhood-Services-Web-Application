import React, { useState, useRef, useEffect } from 'react';
import googleMapsService from '../services/googleMapsService';
import toast from 'react-hot-toast';

const LocationSelector = ({ 
  value = '', 
  onChange, 
  onCoordinatesChange, 
  placeholder = 'Enter service location...', 
  className = '',
  coordinates = null 
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [selectedLocation, setSelectedLocation] = useState(coordinates);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedLocation(coordinates);
  }, [coordinates]);

  // Initialize map when modal opens
  useEffect(() => {
    if (isMapOpen && mapRef.current && !mapRef.current.hasChildNodes()) {
      initializeMap();
    }
  }, [isMapOpen]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await googleMapsService.initMap(mapRef.current, {
        center: selectedLocation || { lat: 28.6139, lng: 77.2090 },
        zoom: selectedLocation ? 15 : 12
      });

      // Add click listener to map for location selection
      googleMapsService.onMapClick(handleMapClick);

      // If there's an existing location, show it
      if (selectedLocation) {
        addLocationMarker(selectedLocation);
      }

      // Try to get user's current location
      try {
        const userLocation = await googleMapsService.getCurrentLocation();
        googleMapsService.addUserLocationMarker(userLocation);
        
        // Center on user location if no location is selected
        if (!selectedLocation) {
          googleMapsService.centerMap(userLocation, 14);
        }
      } catch (locationError) {
        console.warn('Could not get user location:', locationError);
      }

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (location) => {
    try {
      // Reverse geocode to get address
      const result = await googleMapsService.google.maps.Geocoder && 
        new googleMapsService.google.maps.Geocoder().geocode({ location });
      
      if (result && result.results && result.results[0]) {
        const address = result.results[0].formatted_address;
        setSearchValue(address);
        setSelectedLocation(location);
        addLocationMarker(location);
        
        // Call parent callbacks
        if (onChange) onChange(address);
        if (onCoordinatesChange) onCoordinatesChange(location);
      } else {
        // Fallback to coordinates if geocoding fails
        const coordString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        setSearchValue(coordString);
        setSelectedLocation(location);
        addLocationMarker(location);
        
        if (onChange) onChange(coordString);
        if (onCoordinatesChange) onCoordinatesChange(location);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      toast.error('Could not get address for this location');
    }
  };

  const addLocationMarker = (location) => {
    // Clear existing service markers (we'll reuse the method)
    googleMapsService.clearServiceMarkers();
    
    // Add a single marker for the selected location
    const marker = new googleMapsService.google.maps.Marker({
      position: location,
      map: googleMapsService.map,
      title: 'Selected Location',
      icon: {
        url: 'data:image/svg+xml,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#DC2626"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new googleMapsService.google.maps.Size(32, 32),
        anchor: new googleMapsService.google.maps.Point(16, 32)
      }
    });

    googleMapsService.markers = [marker]; // Store for clearing later
    googleMapsService.centerMap(location, 15);
  };

  const handleSearchAddress = async () => {
    if (!searchValue.trim()) return;

    try {
      setIsLoading(true);
      const result = await googleMapsService.geocodeAddress(searchValue);
      
      setSelectedLocation(result);
      addLocationMarker(result);
      
      // Update the search value with the formatted address
      setSearchValue(result.formatted_address);
      
      // Call parent callbacks
      if (onChange) onChange(result.formatted_address);
      if (onCoordinatesChange) onCoordinatesChange({
        lat: result.lat,
        lng: result.lng
      });

      toast.success('Location found!');
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Could not find this address. Please try a different search term.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await googleMapsService.getCurrentLocation();
      
      try {
        // Try to reverse geocode to get address
        const formattedAddress = await reverseGeocode(location.lat, location.lng);
        
        setSearchValue(formattedAddress);
        setSelectedLocation(location);
        
        if (isMapOpen) {
          addLocationMarker(location);
        }
        
        // Call parent callbacks
        if (onChange) onChange(formattedAddress);
        if (onCoordinatesChange) onCoordinatesChange(location);
        
        toast.success('Current location set!');
      } catch (geocodeError) {
        // Fallback to coordinates if geocoding fails
        const coordString = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        setSearchValue(coordString);
        setSelectedLocation(location);
        
        if (isMapOpen) {
          addLocationMarker(location);
        }
        
        // Call parent callbacks
        if (onChange) onChange(coordString);
        if (onCoordinatesChange) onCoordinatesChange(location);
        
        toast.success('Current location set!');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.error('Could not get your current location');
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      if (!googleMapsService.google) {
        await googleMapsService.loader.load();
      }
      
      const geocoder = new googleMapsService.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].formatted_address);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Reverse geocoding error: ${error.message}`);
    }
  };

  const clearLocation = () => {
    setSearchValue('');
    setSelectedLocation(null);
    if (onChange) onChange('');
    if (onCoordinatesChange) onCoordinatesChange(null);
    
    if (isMapOpen) {
      googleMapsService.clearServiceMarkers();
    }
  };

  return (
    <div className={className}>
      {/* Location input with search */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={!searchValue.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            📍 Use Current Location
          </button>
          
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            🗺️ Select on Map
          </button>

          {(searchValue || selectedLocation) && (
            <button
              type="button"
              onClick={clearLocation}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
            ⚠️ {error}
          </div>
        )}

        {/* Manual override for coordinates */}
        {selectedLocation && searchValue && searchValue.startsWith('Location:') && (
          <div className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            💡 Tip: You can manually type a proper address above (e.g., "123 Main St, City, State")
          </div>
        )}

        {/* Selected coordinates display */}
        {selectedLocation && (
          <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Click anywhere on the map to select your service location
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
                
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg border border-gray-300"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <div className="text-sm text-gray-600">
                {selectedLocation ? 
                  `Selected: ${searchValue}` : 
                  'No location selected'
                }
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsMapOpen(false)}
                  disabled={!selectedLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;