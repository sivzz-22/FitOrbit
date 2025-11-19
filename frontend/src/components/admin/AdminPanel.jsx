import { useState } from 'react';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import ChallengesAdmin from './ChallengesAdmin';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'challenges' && <ChallengesAdmin />}
      </div>
    </div>
  );
};

export default AdminPanel;

