import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProfileForm from './ProfileForm';
import ChangePasswordModal from './ChangePasswordModal';
import Loading from '../common/Loading';
import { format } from 'date-fns';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/users/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fitorbit-data-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      {profile && (
        <>
          <div className="profile-sections">
            <div className="profile-section card profile-summary">
              <h2>Personal Information</h2>
              <div className="profile-info">
                <div className="avatar-block">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt={profile.name} />
                  ) : (
                    <div className="avatar-placeholder">{profile.name?.charAt(0)}</div>
                  )}
                  <div>
                    <strong>{profile.name}</strong>
                    <small>@{profile.username || 'set a username'}</small>
                  </div>
                </div>
                <div className="info-item">
                  <label>Name:</label>
                  <span>{profile.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-item">
                  <label>Username:</label>
                  <span>@{profile.username || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{profile.phone || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Height:</label>
                  <span>{profile.height ? `${profile.height} cm` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Weight:</label>
                  <span>{profile.weight ? `${profile.weight} kg` : 'Not set'}</span>
                </div>
                {profile.goals && (
                  <div className="info-item full-width">
                    <label>Goals:</label>
                    <span>{profile.goals}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section card">
              <h2>Statistics</h2>
              <div className="profile-stats">
                <div className="stat-item">
                  <label>Total Workouts:</label>
                  <span className="stat-value">{profile.stats?.totalWorkouts || 0}</span>
                </div>
                <div className="stat-item">
                  <label>Average Calories:</label>
                  <span className="stat-value">{profile.stats?.avgCalories || 0} cal</span>
                </div>
                <div className="stat-item">
                  <label>Last Workout:</label>
                  <span className="stat-value">
                    {profile.stats?.lastWorkoutDate
                      ? format(new Date(profile.stats.lastWorkoutDate), 'MMM dd, yyyy')
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ProfileForm profile={profile} onSuccess={fetchProfile} />

          <div className="profile-actions card">
            <h2>Account Actions</h2>
            <div className="actions-grid">
              <button
                className="btn btn-primary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleExport}
              >
                Export Data (CSV)
              </button>
            </div>
          </div>

          {showPasswordModal && (
            <ChangePasswordModal
              onClose={() => setShowPasswordModal(false)}
              onSuccess={() => {
                setShowPasswordModal(false);
                alert('Password changed successfully');
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;

