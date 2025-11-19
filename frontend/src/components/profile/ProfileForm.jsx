import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProfileForm.css';

const ProfileForm = ({ profile, onSuccess }) => {
  const { refreshUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    profilePhoto: '',
    height: '',
    weight: '',
    goals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '',
        height: profile.height || '',
        weight: profile.weight || '',
        goals: profile.goals || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/users/profile', formData);
      await refreshUserProfile();
      setSuccess('Profile updated successfully');
      onSuccess();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form card">
      <h2>Edit Profile</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">Username (shared handle)</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., siva.fit"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555 555 5555"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profilePhoto">Profile Photo URL</label>
            <input
              type="url"
              id="profilePhoto"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 175"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="e.g., 70.5"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="goals">Fitness Goals</label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            rows="4"
            placeholder="Enter your fitness goals..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;

