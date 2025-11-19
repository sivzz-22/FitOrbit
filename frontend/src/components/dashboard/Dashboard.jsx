import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardStats from './DashboardStats';
import ActivityTrends from './ActivityTrends';
import RecoveryHydration from './RecoveryHydration';
import WorkoutPieChart from './WorkoutPieChart';
import TodaysWorkouts from './TodaysWorkouts';
import AddSectionModal from './AddSectionModal';
import ManageSectionsModal from './ManageSectionsModal';
import Loading from '../common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [wellnessData, setWellnessData] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionStats, setSectionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricRange, setMetricRange] = useState(14);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showManageSections, setShowManageSections] = useState(false);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [metricRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, wellnessRes, sectionsRes, sectionStatsRes, challengesRes] = await Promise.all([
        api.get('/workouts/today'),
        api.get(`/metrics/dashboard?days=${metricRange}`),
        api.get('/sections'),
        api.get('/sections/stats'),
        api.get('/social/challenges', { params: { limit: 3 } })
      ]);

      setTodaysWorkouts(workoutsRes.data);
      setWellnessData(wellnessRes.data);
      setSections(sectionsRes.data);
      setSectionStats(sectionStatsRes.data);
      setChallenges(challengesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionsUpdated = () => {
    fetchDashboardData();
    setShowSectionModal(false);
    setShowManageSections(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowManageSections(true)}
          >
            Manage Sections
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowSectionModal(true)}
          >
            Add Section
          </button>
        </div>
      </div>

      {wellnessData && (
        <DashboardStats summary={wellnessData} />
      )}

      <div className="dashboard-grid">
        <ActivityTrends
          entries={wellnessData?.entries || []}
          range={metricRange}
          onRangeChange={setMetricRange}
        />
        <RecoveryHydration 
          entries={wellnessData?.entries || []}
          range={metricRange}
          onRangeChange={setMetricRange}
        />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Workout Distribution</h2>
            <p className="card-subtitle">Section-wise breakdown of completed workouts</p>
          </div>
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => setShowManageSections(true)}
          >
            Edit
          </button>
        </div>
        <WorkoutPieChart data={sectionStats} />
      </div>

      <TodaysWorkouts workouts={todaysWorkouts} onUpdate={fetchDashboardData} />
      {challenges.length > 0 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Current Challenges</h2>
              <p className="card-subtitle">Accept a challenge and climb the community rankings</p>
            </div>
          </div>
          <div className="challenge-list">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-row">
                <div>
                  <h4>{challenge.title}</h4>
                  <p>{challenge.description}</p>
                </div>
                {challenge.deadline && (
                  <small>Ends {new Date(challenge.deadline).toLocaleDateString()}</small>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showSectionModal && (
        <AddSectionModal
          onClose={() => setShowSectionModal(false)}
          onSuccess={handleSectionsUpdated}
        />
      )}

      {showManageSections && (
        <ManageSectionsModal
          sections={sections}
          onClose={() => setShowManageSections(false)}
          onSuccess={handleSectionsUpdated}
        />
      )}
    </div>
  );
};

export default Dashboard;

