import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import MapView from '../components/MapView';

const ServicesWithMap = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map', 'both'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRadius, setNearbyRadius] = useState(10); // km
  const [mapServices, setMapServices] = useState([]);

  const getDefaultServiceImage = (category) => {
    const defaultImages = {
      'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
      'Carpentry': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
      'Cleaning': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop',
      'Gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      'Appliance Repair': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Painting': 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop',
      'HVAC': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop';
  };

  // Fetch categories
  const { data: categories = [] } = useQuery(
    'serviceCategories',
    () => apiService.getDistinctCategories().then(response => response.data),
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch subcategories when category changes
  const { data: subcategories = [] } = useQuery(
    ['serviceSubcategories', selectedCategory],
    () => selectedCategory ? 
      apiService.getDistinctSubcategories(selectedCategory).then(response => response.data) : 
      Promise.resolve([]),
    { 
      enabled: !!selectedCategory,
      staleTime: 5 * 60 * 1000 
    }
  );

  // Fetch services based on current filters and mode
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: servicesError,
    refetch: refetchServices
  } = useQuery(
    [
      'services',
      currentPage,
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      locationFilter,
      sortBy,
      sortOrder,
      isNearbyMode,
      userLocation,
      nearbyRadius
    ],
    async () => {
      if (isNearbyMode && userLocation) {
        // Fetch nearby services
        const response = await apiService.getNearbyServices(
          userLocation.lat,
          userLocation.lng,
          nearbyRadius
        );
        return {
          content: response.data,
          totalElements: response.data.length,
          totalPages: 1,
          first: true,
          last: true,
          number: 0
        };
      } else {
        // Fetch regular services with filters
        const params = {
          page: currentPage,
          size: 12,
          sortBy,
          sortDirection: sortOrder
        };

        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        if (locationFilter) params.location = locationFilter;

        const response = await apiService.getServices(params);
        return response.data;
      }
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      }
    }
  );

  // Fetch services for map view
  const fetchMapServices = useCallback(async (bounds = null) => {
    try {
      let response;
      if (bounds) {
        // Fetch services within map bounds
        response = await apiService.getServicesInBounds(bounds);
      } else {
        // Fetch all services with coordinates
        response = await apiService.getServicesForMap();
      }
      setMapServices(response.data || []);
    } catch (error) {
      console.error('Error fetching map services:', error);
      // Don't show error toast for map services, let the component handle it
      setMapServices([]);
    }
  }, []);

  // Load map services when view mode includes map
  useEffect(() => {
    if (viewMode === 'map' || viewMode === 'both') {
      fetchMapServices();
    }
  }, [viewMode, fetchMapServices]);

  // Get user location for nearby search
  const getUserLocation = useCallback(async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not get your location');
      throw error;
    }
  }, []);

  // Toggle nearby mode
  const toggleNearbyMode = async () => {
    if (!isNearbyMode) {
      try {
        await getUserLocation();
        setIsNearbyMode(true);
        setCurrentPage(0);
        toast.success('Showing nearby services');
      } catch (error) {
        // Location error already handled in getUserLocation
      }
    } else {
      setIsNearbyMode(false);
      setCurrentPage(0);
      toast.success('Showing all services');
    }
  };

  // Handle search and filter changes
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    refetchServices();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setLocationFilter('');
    setPriceRange({ min: '', max: '' });
    setIsNearbyMode(false);
    setCurrentPage(0);
  };

  // Force reset category on component mount
  useEffect(() => {
    setSelectedCategory('');
    setSelectedSubcategory('');
  }, []);

  // Handle service selection
  const handleServiceSelect = (service) => {
    navigate(`/services/${service.id}`);
  };

  // Handle map bounds change - DISABLED to prevent continuous requests
  const handleMapBoundsChange = useCallback(async (bounds) => {
    // Temporarily disabled to prevent log spam until services have coordinates
    console.log('Map bounds changed, but skipping API call to prevent spam');
    return;
    
    if (viewMode === 'map' || viewMode === 'both') {
      await fetchMapServices(bounds);
    }
  }, [viewMode, fetchMapServices]);

  const services = servicesData?.content || [];
  const totalPages = servicesData?.totalPages || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Services</h1>
        <p className="text-gray-600">
          Discover and book services near you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main search bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search services, categories, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category filter */}
            <select
              key="category-select"
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('');
                setCurrentPage(0);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Subcategory filter */}
            <select
              key="subcategory-select"
              value={selectedSubcategory || ''}
              onChange={(e) => {
                setSelectedSubcategory(e.target.value);
                setCurrentPage(0);
              }}
              disabled={!selectedCategory}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">All Subcategories</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>

            {/* Location filter */}
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Name: A to Z</option>
              <option value="title-desc">Name: Z to A</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleNearbyMode}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isNearbyMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📍 {isNearbyMode ? `Within ${nearbyRadius}km` : 'Find Nearby'}
            </button>

            {isNearbyMode && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Radius:</label>
                <select
                  value={nearbyRadius}
                  onChange={(e) => {
                    setNearbyRadius(Number(e.target.value));
                    if (isNearbyMode) {
                      setCurrentPage(0);
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={5}>5km</option>
                  <option value={10}>10km</option>
                  <option value={25}>25km</option>
                  <option value={50}>50km</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setViewMode('both')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'both'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📍 Both
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {isLoadingServices ? 'Loading...' : `${servicesData?.totalElements || 0} services found`}
        </div>
      </div>

      {/* Content */}
      <div className={`${viewMode === 'both' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'both') && (
          <div className={viewMode === 'both' ? 'lg:order-2' : ''}>
            <MapView
              services={mapServices.length > 0 ? mapServices : services}
              onServiceSelect={handleServiceSelect}
              showUserLocation={true}
              height={viewMode === 'both' ? '600px' : '70vh'}
              onBoundsChange={null}
              className="rounded-lg shadow-sm border border-gray-200"
            />
          </div>
        )}

        {/* List View */}
        {(viewMode === 'list' || viewMode === 'both') && (
          <div className={viewMode === 'both' ? 'lg:order-1' : ''}>
            {isLoadingServices ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : servicesError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading services. Please try again.</p>
                <button 
                  onClick={() => refetchServices()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  {isNearbyMode 
                    ? 'No services found in your area. Try increasing the radius or searching in a different location.'
                    : 'No services match your current filters. Try adjusting your search criteria.'
                  }
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={service.serviceImages || service.imageUrl || getDefaultServiceImage(service.category)}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = getDefaultServiceImage(service.category);
                            }}
                          />
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {service.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {service.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                        <p className="text-gray-600 mb-2">
                          by {service.providerName || service.provider?.name || 'Unknown Provider'}
                        </p>

                        <div className="flex items-center mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(service.price)}
                          </span>
                          <span className="text-gray-600 ml-1">/hour</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                            {service.category}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {service.subcategory}
                          </span>
                        </div>

                        {service.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {service.location}
                          </div>
                        )}

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {service.description}
                        </p>

                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          View Details
                        </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesWithMap;