import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import './ChallengesAdmin.css';

const defaultForm = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  deadline: '',
  reward: ''
};

const ChallengesAdmin = () => {
  const [challenges, setChallenges] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leaderboards, setLeaderboards] = useState({});
  const [loadingLeaderboards, setLoadingLeaderboards] = useState({});

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/social/challenges');
      setChallenges(data);
      // Fetch leaderboards for all challenges
      data.forEach((challenge) => {
        fetchLeaderboard(challenge._id);
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (challengeId) => {
    try {
      setLoadingLeaderboards((prev) => ({ ...prev, [challengeId]: true }));
      const { data } = await api.get(`/social/challenges/${challengeId}/leaderboard`);
      setLeaderboards((prev) => ({ ...prev, [challengeId]: data }));
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoadingLeaderboards((prev) => ({ ...prev, [challengeId]: false }));
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.post('/social/challenges', form);
      setForm(defaultForm);
      setSuccess('Challenge posted successfully');
      fetchChallenges();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Challenge</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="challenge-admin-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reward">Reward</label>
            <input
              type="text"
              id="reward"
              name="reward"
              value={form.reward}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Posting...' : 'Publish Challenge'}
        </button>
      </form>

      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <div className="dashboard-card-header">
          <h3>Recent Challenges</h3>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : challenges.length ? (
          <div className="challenges-list">
            {challenges.map((challenge) => {
              const leaderboard = leaderboards[challenge._id];
              const isLoading = loadingLeaderboards[challenge._id];
              return (
                <div key={challenge._id} className="challenge-admin-item card">
                  <div className="challenge-admin-header">
                    <div>
                      <h4>{challenge.title}</h4>
                      <p>{challenge.description}</p>
                      <div className="challenge-meta">
                        <span className="badge">{challenge.difficulty}</span>
                        {challenge.deadline && (
                          <small>Deadline: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}</small>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="challenge-leaderboard">
                    <h5>Leaderboard</h5>
                    {isLoading ? (
                      <p>Loading leaderboard...</p>
                    ) : leaderboard?.leaderboard?.length ? (
                      <ol className="leaderboard-list">
                        {leaderboard.leaderboard.map((entry) => (
                          <li key={entry.user._id}>
                            <span className="rank-badge">#{entry.rank}</span>
                            <div className="leaderboard-user">
                              <strong>{entry.user.name}</strong>
                              <small>@{entry.user.username || 'unknown'}</small>
                            </div>
                            <small className="completion-time">
                              {format(new Date(entry.completedAt), 'MMM dd, yyyy HH:mm')}
                            </small>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="empty-state">No completions yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No challenges posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ChallengesAdmin;


