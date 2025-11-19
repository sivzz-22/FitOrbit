import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import CreateWorkout from './CreateWorkout';
import WorkoutCard from './WorkoutCard';
import Loading from '../common/Loading';
import './WorkoutPage.css';

const WorkoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const exerciseId = searchParams.get('exercise');
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'Mixed'];

  useEffect(() => {
    fetchWorkouts();
    if (editId || exerciseId) {
      setShowCreateForm(true);
    }
  }, [editId, exerciseId]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (workoutId) => {
    try {
      await api.post(`/workouts/${workoutId}/start`);
      navigate(`/workout-session/${workoutId}`);
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Failed to start workout. Please try again.');
    }
  };

  const filteredWorkouts = selectedCategory === 'All' 
    ? workouts 
    : workouts.filter(w => w.category === selectedCategory);

  const getCategoryCount = (category) => {
    if (category === 'All') return workouts.length;
    return workouts.filter(w => w.category === category).length;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="workout-page">
      <div className="workout-header">
        <div>
          <h1>Workouts</h1>
          <p className="workout-subtitle">Manage your workout templates and sessions</p>
        </div>
        <button 
          className="btn btn-primary create-workout-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <span>▷</span> Create New Workout
        </button>
      </div>

      {showCreateForm && (
        <CreateWorkout
          workoutId={editId}
          exerciseId={exerciseId}
          onSuccess={() => {
            setShowCreateForm(false);
            navigate('/workouts');
            fetchWorkouts();
          }}
          onCancel={() => {
            setShowCreateForm(false);
            navigate('/workouts');
          }}
        />
      )}

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({getCategoryCount(category)})
          </button>
        ))}
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>No workouts created yet.</h2>
            <p>Start your fitness journey by creating your first workout!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="workouts-grid">
          {filteredWorkouts.map(workout => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onStart={() => handleStartWorkout(workout._id)}
              onEdit={() => navigate(`/workouts?edit=${workout._id}`)}
              onDelete={async () => {
                if (window.confirm('Are you sure you want to delete this workout?')) {
                  try {
                    await api.delete(`/workouts/${workout._id}`);
                    fetchWorkouts();
                  } catch (error) {
                    console.error('Error deleting workout:', error);
                  }
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
