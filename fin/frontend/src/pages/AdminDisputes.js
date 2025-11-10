import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminDisputes = () => {
  const { loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin()) {
      navigate('/admin/login');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingData(true);
        const resp = await apiService.getAdminDisputes();
        setDisputes(resp.data || []);
      } catch (e) { 
        console.error(e);
      }
      finally { 
        setLoadingData(false); 
      }
    };
    fetch();
  }, []);

  const handleResolve = async (id) => {
    try {
      await apiService.resolveDispute(id, { refundAmount: null, adminNote: 'Addressed by admin' });
      setDisputes(d => d.filter(x => x.id !== id));
      toast.success('Dispute marked as addressed');
    } catch (e) { 
      console.error(e);
      toast.error('Failed to address dispute');
    }
  };

  const handleReject = async (id) => {
    const note = prompt('Admin note (optional)');
    try {
      await apiService.rejectDispute(id, { adminNote: note || '' });
      setDisputes(d => d.filter(x => x.id !== id));
      toast.success('Dispute rejected');
    } catch (e) { 
      console.error(e);
      toast.error('Failed to reject dispute');
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
            <h1 className="text-3xl font-bold">Dispute Resolution</h1>
            <p className="text-blue-100">Review and resolve customer disputes</p>
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
            <p className="text-gray-600">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">✓ No open disputes. All issues resolved!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(d => (
              <div key={d.id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-800">Dispute #{d.id}</h3>
                      <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">{d.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <strong>Booking ID:</strong> {d.booking?.id}
                      </div>
                      <div>
                        <strong>Reporter:</strong> {d.reporter?.name || 'N/A'}
                      </div>
                      <div className="col-span-2">
                        <strong>Description:</strong>
                        <p className="mt-1 text-gray-700">{d.description}</p>
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                      {d.adminNote && (
                        <div className="col-span-2">
                          <strong>Admin Note:</strong>
                          <p className="mt-1 text-gray-700">{d.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleResolve(d.id)} 
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                      ✓ Addressed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDisputes;
