import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isProvider, isCustomer } = useAuth();

  const categories = [
    { name: 'Electrical', icon: '⚡', description: 'Licensed electricians for all your electrical needs' },
    { name: 'Plumbing', icon: '🔧', description: 'Professional plumbers for repairs and installations' },
    { name: 'Carpentry', icon: '🔨', description: 'Skilled carpenters for furniture and home projects' },
    { name: 'Appliance Repair', icon: '🔌', description: 'Expert technicians for appliance repairs' },
    { name: 'Cleaning', icon: '🧽', description: 'Professional cleaning services for your home' },
    { name: 'Gardening', icon: '🌱', description: 'Landscaping and garden maintenance services' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with background video */}
      <section className="relative text-white">
        {/* Video background - place hero-vid.mp4 in public/ */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            src="/hero-vid.mp4"
            autoPlay
            muted
            loop
            playsInline
            poster="/projects-hero.png"
          />
          {/* Dark overlay to improve text contrast with a subtle backdrop blur for video  backdrop-blur-sm  */}
          <div className="absolute inset-0 bg-black/80 md:bg-black/70 " /> 
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
              {isProvider() ? "Grow Your Service Business" : "Find Local Service Providers"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-sm">
              {isProvider() 
                ? "Connect with customers in your neighborhood and showcase your professional services" 
                : "Connect with trusted electricians, plumbers, carpenters, and more in your neighborhood"
              }
            </p>
            <div className="space-x-4">
              {!user ? (
                <>
                  <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                    Get Started
                  </Link>
                  <Link to="/services-map" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                    Browse Services
                  </Link>
                </>
              ) : isProvider() ? (
                <>
                  <Link to="/create-service" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                    ➕ Add My Service
                  </Link>
                  <Link to="/my-services" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors ml-4">
                    📋 Manage Services
                  </Link>
                  <Link to="/dashboard" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors ml-4">
                    📊 Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/services-map" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                    Browse Services
                  </Link>
                  <Link to="/bookings" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors ml-4">
                    📋 My Bookings
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-16 bg-white relative"
        style={{
          backgroundImage: "url('/wave-features.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top center',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isProvider() ? "How to Grow Your Business" : "How FixItNow Works"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isProvider() 
                ? "Simple steps to manage your services and connect with customers" 
                : "Simple steps to connect with local service providers"
              }
            </p>
          </div>

          {isProvider() ? (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">➕</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Services</h3>
                <p className="text-gray-600">Create and list your professional services</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
                <p className="text-gray-600">Handle customer requests and schedule appointments</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat with Customers</h3>
                <p className="text-gray-600">Communicate directly with clients in real-time</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Money</h3>
                <p className="text-gray-600">Get paid for your expertise and quality service</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Search & Browse</h3>
                <p className="text-gray-600">Find service providers by category and location</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Map-Based Search</h3>
                <p className="text-gray-600">Discover services near you with interactive maps</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Book Instantly</h3>
                <p className="text-gray-600">Schedule appointments with available time slots</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
                <p className="text-gray-600">Share feedback to help others make informed decisions</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section
        className="py-16 bg-gray-50 relative"
        style={{
          backgroundImage: "url('/wave-categories.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isProvider() ? "Service Categories You Can Offer" : "Popular Service Categories"}
            </h2>
            <p className="text-xl text-gray-600">
              {isProvider() 
                ? "Choose categories that match your expertise" 
                : "Find the right professional for your needs"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={isProvider() 
                  ? `/create-service?category=${category.name.toLowerCase()}` 
                  : `/services?category=${category.name.toLowerCase()}`
                }
                className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                  {isProvider() && (
                    <div className="mt-3">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        Create Service
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isProvider()
              ? "Start Growing Your Business!"
              : user
              ? "Find Trusted Local Services"
              : "Ready to Get Started?"
            }
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {isProvider()
              ? "List your first service and connect with customers in your area"
              : user
              ? "Browse verified service providers nearby and book instantly"
              : "Join thousands of satisfied customers and service providers on our platform"
            }
          </p>

          {/* Buttons: guest, provider, or logged-in customer */}
          {!user ? (
            <div className="space-x-4">
              <Link to="/register?role=customer" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Find Services
              </Link>
              <Link to="/register?role=provider" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Become a Provider
              </Link>
            </div>
          ) : isProvider() ? (
            <div className="space-x-4">
              <Link to="/create-service" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                ➕ Create Your First Service
              </Link>
              <Link to="/dashboard" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                📊 Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/services-map" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                Browse Services
              </Link>
              {/* <Link to="/bookings" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                📋 My Bookings
              </Link> */}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;