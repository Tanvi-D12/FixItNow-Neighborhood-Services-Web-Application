import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminProviders = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/admin/login');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingData(true);
        const resp = await apiService.getPendingProviders();
        setProviders(resp.data || []);
      } catch (e) {
        console.error('Failed to load providers', e);
      } finally {
        setLoadingData(false);
      }
    };
    fetch();
  }, []);

  const handleVerify = async (id) => {
    try {
      await apiService.adminVerifyProvider(id);
      setProviders((p) => p.filter(x => x.id !== id));
      toast.success('Provider verified successfully');
    } catch (e) { 
      console.error(e);
      toast.error('Failed to verify provider');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional)');
    try {
      await apiService.adminRejectProvider(id, reason || '');
      setProviders((p) => p.filter(x => x.id !== id));
      toast.success('Provider rejected');
    } catch (e) { 
      console.error(e);
      toast.error('Failed to reject provider');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Provider Verification</h1>
            <p className="text-blue-100">Review and approve pending service providers</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading pending providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">✓ No pending providers. All providers have been verified!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((prov) => (
              <div key={prov.id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{prov.name}</h3>
                      <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">PENDING</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <strong>Email:</strong> {prov.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {prov.phone || 'N/A'}
                      </div>
                      <div>
                        <strong>Location:</strong> {prov.location || 'N/A'}
                      </div>
                      <div>
                        <strong>Service Area:</strong> {prov.serviceArea || 'N/A'}
                      </div>
                      {prov.bio && (
                        <div className="col-span-2">
                          <strong>Bio:</strong> {prov.bio}
                        </div>
                      )}
                      {prov.experience && (
                        <div>
                          <strong>Experience:</strong> {prov.experience}
                        </div>
                      )}
                      {prov.documentType && (
                        <div>
                          <strong>Document Type:</strong> {prov.documentType}
                        </div>
                      )}
                      {prov.verificationDocument && (
                        <div className="col-span-2">
                          <strong>Business Document:</strong>{' '}
                          <button
                            onClick={() => setSelectedProvider(prov)}
                            className="text-blue-600 hover:text-blue-800 underline ml-2"
                          >
                            View Document
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleVerify(prov.id)} 
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                      ✓ Verify
                    </button>
                    <button 
                      onClick={() => handleReject(prov.id)} 
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Document Viewer Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProvider.name} - {selectedProvider.documentType}
              </h2>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-auto">
              {selectedProvider.verificationDocument && selectedProvider.verificationDocument.startsWith('data:') ? (
                <img 
                  src={selectedProvider.verificationDocument} 
                  alt="Business Document"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
                  Document not available
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleVerify(selectedProvider.id);
                  setSelectedProvider(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ✓ Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
