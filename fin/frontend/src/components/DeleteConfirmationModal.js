import React from 'react';
import toast from 'react-hot-toast';

const DeleteConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  itemName,
  type, // 'user', 'service', 'provider'
  onConfirm, 
  onCancel,
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const getDeleteMessage = () => {
    switch(type) {
      case 'user':
        return `Are you sure you want to delete this user "${itemName}"? This action cannot be undone.`;
      case 'provider':
        return `Are you sure you want to delete this provider "${itemName}"? All their services will also be deleted.`;
      case 'service':
        return `Are you sure you want to delete the service "${itemName}"? This action cannot be undone.`;
      default:
        return message || 'Are you sure you want to proceed? This action cannot be undone.';
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'user':
        return 'Delete User Account';
      case 'provider':
        return 'Delete Provider Account';
      case 'service':
        return 'Delete Service';
      default:
        return title || 'Confirm Delete';
    }
  };

  const getRiskColor = () => {
    return type === 'provider' ? 'text-red-700' : 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <h2 className={`text-lg font-bold ${getRiskColor()}`}>
            ⚠️ {getTitle()}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {getDeleteMessage()}
          </p>

          {type === 'provider' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-700 font-semibold">
                ⚠️ Warning: Deleting a provider will also permanently remove:
              </p>
              <ul className="text-sm text-red-600 mt-2 ml-4 list-disc">
                <li>All their services</li>
                <li>All their bookings</li>
                <li>All associated data</li>
              </ul>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              💡 <strong>Note:</strong> Deleted data will be soft-deleted and can be recovered by admins if needed.
            </p>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </>
            ) : (
              <>🗑️ Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
