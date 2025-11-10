import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';
  const isUpgrade = searchParams.get('upgrade') === 'true';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    location: '',
    phone: '',
    bio: '',
    experience: '',
    serviceArea: '',
    documentType: '',
    verificationDocument: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'verificationDocument' && files && files[0]) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [name]: reader.result
        });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.role === 'provider' && !formData.documentType) {
      toast.error('Please select a document type');
      return;
    }

    if (formData.role === 'provider' && !formData.verificationDocument) {
      toast.error('Please upload a business document');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        toast.success(result.message + (formData.role === 'provider' ? ' Your profile is under admin review. You will be notified once verified.' : ''));
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {isUpgrade ? (
            <>
              <div className="text-center text-4xl mb-4">🚀</div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Upgrade to Service Provider
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Create a new provider account to start offering services
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create {formData.role === 'provider' ? '🏢 Provider' : '👤 Customer'} Account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {formData.role === 'provider' 
                  ? 'Start offering services on FixItNow' 
                  : 'Book services from trusted providers'}
              </p>
              <p className="mt-2 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="input-field"
                placeholder="Enter your city/area"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'customer'})}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    formData.role === 'customer'
                      ? 'bg-primary-600 text-white border-2 border-primary-600'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'provider'})}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    formData.role === 'provider'
                      ? 'bg-primary-600 text-white border-2 border-primary-600'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  🏢 Provider
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {formData.role === 'customer' 
                  ? 'Book services from trusted providers' 
                  : 'Offer services and earn money'}
              </p>
            </div>

            {formData.role === 'provider' && (
              <>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    className="input-field"
                    placeholder="Tell us about yourself and your services"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    type="text"
                    className="input-field"
                    placeholder="e.g., 5 years"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700">
                    Service Area
                  </label>
                  <input
                    id="serviceArea"
                    name="serviceArea"
                    type="text"
                    className="input-field"
                    placeholder="Areas you serve"
                    value={formData.serviceArea}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Business Document Type *
                  </label>
                  <div className="space-y-2">
                    {['ShopAct', 'MSME Certificate', 'Udyam'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="documentType"
                          value={type}
                          checked={formData.documentType === type}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                  {formData.role === 'provider' && !formData.documentType && (
                    <p className="mt-1 text-xs text-red-500">Document type is required</p>
                  )}
                </div>

                <div>
                  <label htmlFor="verificationDocument" className="block text-sm font-medium text-gray-700">
                    Upload Business Document *
                  </label>
                  <input
                    id="verificationDocument"
                    name="verificationDocument"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                  {formData.verificationDocument && (
                    <p className="mt-2 text-xs text-green-600">✓ Document uploaded</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.05 0-9.27-3.11-11-7.5a10.8 10.8 0 0 1 3.17-4.36" />
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;