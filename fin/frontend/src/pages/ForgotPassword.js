import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.forgotPassword(email);
      toast.success('Reset token generated successfully!');
      setResetToken(response.data.token);
      setSubmitted(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error generating reset token';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken);
    setTokenCopied(true);
    toast.success('Token copied to clipboard!');
    
    // Reset the copied state after 2 seconds
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleProceedToReset = () => {
    navigate('/reset-password', { state: { email, token: resetToken } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to generate a password reset token.
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Token...' : 'Generate Reset Token'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Success Message */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-green-800 font-semibold">
                Reset Token Generated Successfully!
              </p>
              <p className="mt-2 text-center text-sm text-green-700">
                Your password reset token has been generated. Copy it below and use it to reset your password.
              </p>
            </div>

            {/* Token Display Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900 font-medium mb-2">Your Reset Token:</p>
              <div className="flex items-center gap-2 bg-white p-3 rounded border border-blue-300">
                <code className="flex-1 text-xs text-gray-700 break-all font-mono">
                  {resetToken}
                </code>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`flex-shrink-0 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    tokenCopied
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {tokenCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Email Display */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-900">
                <span className="font-semibold">Next Step:</span> You can now proceed to the reset password page using your email and this token.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleProceedToReset}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Proceed to Reset Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setResetToken('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Start Over
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

