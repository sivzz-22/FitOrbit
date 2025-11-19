import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/social/notifications', {
          params: { unreadOnly: true, limit: 50 }
        });
        setUnreadCount(data.length);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    const handler = () => fetchUnread();
    window.addEventListener('social:notifications', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('social:notifications', handler);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSocialNav = () => {
    navigate('/social');
  };

  const handleNotificationsNav = () => {
    navigate('/social?tab=notifications');
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayHandle = user?.username ? `@${user.username}` : user?.name;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          FitOrbit
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/workouts">Workouts</Link>
          </li>
          <li>
            <Link to="/exercises">Exercises</Link>
          </li>
          <li>
            <Link to="/metrics">Metrics</Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          <button className="icon-button" onClick={handleNotificationsNav} title="Notifications">
            <span className="icon-bell" />
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>

          <button className="social-chip" onClick={handleSocialNav}>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} />
            ) : (
              <div className="chip-avatar">{user?.name?.charAt(0)}</div>
            )}
            <span>{displayHandle}</span>
          </button>

          <div className="settings-wrapper" ref={settingsRef}>
            <button
              className="icon-button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              title="Settings"
            >
              <span className="icon-gear" />
            </button>
            {settingsOpen && (
              <div className="settings-dropdown">
                <button className="dropdown-item" onClick={toggleTheme}>
                  <span className={`theme-icon ${theme}`} />
                  <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <button className="dropdown-item danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

