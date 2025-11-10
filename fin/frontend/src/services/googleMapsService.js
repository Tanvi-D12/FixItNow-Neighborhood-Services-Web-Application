import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsService {
  constructor() {
    this.map = null;
    this.google = null;
    this.markers = [];
    this.infoWindow = null;
    this.userLocationMarker = null;
    
    // Initialize the Google Maps loader
    this.loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  // Initialize Google Maps
  async initMap(container, options = {}) {
    try {
      this.google = await this.loader.load();
      
      const defaultOptions = {
        center: { lat: 17.3850, lng: 78.4867 }, // Default to Hyderabad, India
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      this.map = new this.google.maps.Map(container, { ...defaultOptions, ...options });
      this.infoWindow = new this.google.maps.InfoWindow();
      
      return this.map;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  // Add user location marker
  addUserLocationMarker(position) {
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
    }

    this.userLocationMarker = new this.google.maps.Marker({
      position: position,
      map: this.map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new this.google.maps.Size(24, 24),
        anchor: new this.google.maps.Point(12, 12)
      }
    });

    return this.userLocationMarker;
  }

  // Add service markers to the map
  addServiceMarkers(services, onMarkerClick) {
    // Clear existing markers
    this.clearServiceMarkers();

    services.forEach(service => {
      if (service.latitude && service.longitude) {
        const marker = new this.google.maps.Marker({
          position: { lat: service.latitude, lng: service.longitude },
          map: this.map,
          title: service.title,
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#2563EB"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new this.google.maps.Size(32, 32),
            anchor: new this.google.maps.Point(16, 32)
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          this.showServiceInfoWindow(marker, service, onMarkerClick);
        });

        // Store marker with service data
        marker.serviceData = service;
        this.markers.push(marker);
      }
    });
  }

  // Show info window for service
  showServiceInfoWindow(marker, service, onMarkerClick) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const infoContent = `
      <div style="max-width: 300px; padding: 10px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
          ${service.title}
        </h3>
        <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">
          by ${service.providerName || service.provider?.name || 'Unknown Provider'}
        </p>
        <div style="margin: 8px 0;">
          <span style="font-weight: bold; color: #2563eb; font-size: 18px;">
            ${formatCurrency(service.price)}/hour
          </span>
        </div>
        <p style="margin: 6px 0; color: #4b5563; font-size: 12px;">
          ${service.category} > ${service.subcategory}
        </p>
        <p style="margin: 6px 0; color: #6b7280; font-size: 13px;">
          📍 ${service.location}
        </p>
        <button 
          onclick="window.selectService && window.selectService(${service.id})"
          style="
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px;
            margin-top: 8px;
            width: 100%;
          "
        >
          View Details
        </button>
      </div>
    `;

    this.infoWindow.setContent(infoContent);
    this.infoWindow.open(this.map, marker);

    // Set up global callback for button click
    window.selectService = (serviceId) => {
      if (onMarkerClick) {
        onMarkerClick(service);
      }
      this.infoWindow.close();
    };
  }

  // Clear service markers
  clearServiceMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  // Fit map to show all markers
  fitBounds(includeUserLocation = true) {
    if (this.markers.length === 0 && !includeUserLocation) return;

    const bounds = new this.google.maps.LatLngBounds();
    
    // Add service markers to bounds
    this.markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });

    // Add user location to bounds if it exists
    if (includeUserLocation && this.userLocationMarker) {
      bounds.extend(this.userLocationMarker.getPosition());
    }

    // Only fit bounds if we have markers
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = this.google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        if (this.map.getZoom() > 15) {
          this.map.setZoom(15);
        }
      });
    }
  }

  // Search for places using Google Places API
  async searchPlaces(query, location = null) {
    if (!this.google) {
      throw new Error('Google Maps not initialized');
    }

    const service = new this.google.maps.places.PlacesService(this.map);
    
    return new Promise((resolve, reject) => {
      const request = {
        query: query,
        fields: ['place_id', 'name', 'geometry', 'formatted_address']
      };

      if (location) {
        request.location = location;
        request.radius = 50000; // 50km radius
      }

      service.textSearch(request, (results, status) => {
        if (status === this.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error('Places search failed: ' + status));
        }
      });
    });
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    if (!this.google) {
      throw new Error('Google Maps not initialized');
    }

    const geocoder = new this.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === this.google.maps.GeocoderStatus.OK && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  }

  // Get visible map bounds
  getMapBounds() {
    if (!this.map) return null;
    
    const bounds = this.map.getBounds();
    if (!bounds) return null;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    return {
      minLat: sw.lat(),
      maxLat: ne.lat(),
      minLng: sw.lng(),
      maxLng: ne.lng()
    };
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    if (!this.google) return null;

    const distance = this.google.maps.geometry.spherical.computeDistanceBetween(
      new this.google.maps.LatLng(point1.lat, point1.lng),
      new this.google.maps.LatLng(point2.lat, point2.lng)
    );

    return distance / 1000; // Return distance in kilometers
  }

  // Add click listener to map
  onMapClick(callback) {
    if (this.map) {
      this.map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        callback({ lat, lng });
      });
    }
  }

  // Center map on location
  centerMap(location, zoom = 14) {
    if (this.map) {
      this.map.setCenter(location);
      this.map.setZoom(zoom);
    }
  }
}

// Create singleton instance
const googleMapsService = new GoogleMapsService();

export default googleMapsService;