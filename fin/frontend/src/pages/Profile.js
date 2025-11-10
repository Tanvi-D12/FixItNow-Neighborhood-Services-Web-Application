import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    apiService.getCurrentUser()
      .then(res => {
        console.log('User data received:', res.data);
        const avatarUrl = res.data.avatarUrl || res.data.profileImage;
        console.log('Avatar URL:', avatarUrl);
        setUser(res.data);
        setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
        setAvatarPreview(avatarUrl);
      })
      .catch(() => {
        setMessage('Failed to load profile.');
        setMessageType('error');
      });
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: user.name, email: user.email, phone: user.phone || '' });
    const avatarUrl = user.avatarUrl || user.profileImage;
    setAvatarPreview(avatarUrl);
    setAvatar(null);
    setMessage('');
    setMessageType('');
  };

  const getAvatarUrl = (url) => {
    if (!url) return '/default-avatar.svg';
    // If URL starts with http, use as is
    if (url.startsWith('http')) return url;
    // If URL is relative, prepend API base URL
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    return `${apiBase}${url}`;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = user.avatarUrl || user.profileImage;
      if (avatar) {
        const res = await apiService.uploadFile(avatar, 'avatar');
        avatarUrl = res.data.url;
        console.log('Avatar uploaded, URL:', avatarUrl);
      }
      console.log('Updating user profile with avatarUrl:', avatarUrl);
      const updateResponse = await apiService.updateUserProfile(user.id, { ...form, avatarUrl });
      
      // Use the response from backend which includes the updated user data
      const updatedUserFromBackend = updateResponse.data.user || { ...user, ...form, avatarUrl };
      console.log('Updated user from backend:', updatedUserFromBackend);
      
      // Update local state and AuthContext with the fresh data
      setUser(updatedUserFromBackend);
      setAvatarPreview(updatedUserFromBackend.profileImage || updatedUserFromBackend.avatarUrl || avatarUrl);
      updateUser(updatedUserFromBackend);
      
      setEditMode(false);
      setAvatar(null);
      setMessage('Profile updated successfully.');
      setMessageType('success');
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile.');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (passwords.new !== passwords.confirm) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    try {
      // You may need to implement this endpoint in backend: /users/:id/password
      await apiService.updateUserProfile(user.id, { password: passwords.new, currentPassword: passwords.current });
      setMessage('Password changed successfully.');
      setMessageType('success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage('Failed to change password.');
      setMessageType('error');
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Profile</h1>
      {message && (
        <div className={`mb-4 p-3 rounded text-center font-semibold ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <img src={getAvatarUrl(avatarPreview)} alt="Avatar" className="w-20 h-20 rounded-full object-cover mr-4" />
          <div>
            <div className="font-semibold text-lg">{user.name}</div>
            <div className="text-gray-600">{user.email}</div>
            <div className="text-gray-600">{user.phone}</div>
          </div>
        </div>
        {!editMode ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEdit}>Edit Profile</button>
        ) : (
          <div>
            <div className="mb-2">
              <label className="block text-gray-700">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave} disabled={loading}>Save</button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={handleCancel} disabled={loading}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-2">
            <label className="block text-gray-700">Current Password</label>
            <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">New Password</label>
            <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full border px-3 py-2 rounded" required />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;