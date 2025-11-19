import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../common/Loading';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!analytics) {
    return <div className="card">No analytics data available</div>;
  }

  const userGrowthData = {
    labels: ['Last 7 Days', 'Last 14 Days', 'Last 30 Days'],
    datasets: [
      {
        label: 'New Users',
        data: [
          analytics.userGrowth.last7Days,
          analytics.userGrowth.last14Days,
          analytics.userGrowth.last30Days
        ],
        backgroundColor: '#4a90e2'
      }
    ]
  };

  const popularWorkoutsData = {
    labels: analytics.popularWorkouts.slice(0, 5).map(w => w._id),
    datasets: [
      {
        label: 'Usage Count',
        data: analytics.popularWorkouts.slice(0, 5).map(w => w.count),
        backgroundColor: '#50c878'
      }
    ]
  };

  const userGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const popularWorkoutsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="analytics">
      <div className="analytics-stats">
        <div className="stat-card card">
          <h3>Active Users</h3>
          <p className="stat-value">{analytics.activeUsers}</p>
        </div>
        <div className="stat-card card">
          <h3>Total Users</h3>
          <p className="stat-value">{analytics.totalUsers}</p>
        </div>
        <div className="stat-card card">
          <h3>Average Calories</h3>
          <p className="stat-value">{analytics.avgCalories} cal</p>
        </div>
        <div className="stat-card card">
          <h3>Total Workouts</h3>
          <p className="stat-value">{analytics.totalWorkoutsCompleted}</p>
        </div>
        <div className="stat-card card">
          <h3>Total Exercises</h3>
          <p className="stat-value">{analytics.totalExercises}</p>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card card">
          <h3>User Growth</h3>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <Bar data={userGrowthData} options={userGrowthOptions} />
          </div>
        </div>

        {analytics.popularWorkouts.length > 0 && (
          <div className="chart-card card">
            <h3>Popular Workouts</h3>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <Bar data={popularWorkoutsData} options={popularWorkoutsOptions} />
            </div>
          </div>
        )}
      </div>

      {analytics.popularWorkouts.length > 0 && (
        <div className="popular-workouts card">
          <h3>Top Workouts</h3>
          <table>
            <thead>
              <tr>
                <th>Workout</th>
                <th>Usage Count</th>
                <th>Avg Calories</th>
              </tr>
            </thead>
            <tbody>
              {analytics.popularWorkouts.map((workout, index) => (
                <tr key={index}>
                  <td>{workout._id}</td>
                  <td>{workout.count}</td>
                  <td>{Math.round(workout.avgCalories || 0)} cal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;

