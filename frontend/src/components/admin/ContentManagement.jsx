import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../common/Loading';
import { format } from 'date-fns';
import './ContentManagement.css';

const ContentManagement = () => {
  const [pendingWorkouts, setPendingWorkouts] = useState([]);
  const [pendingExercises, setPendingExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workouts');

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const [workoutsRes, exercisesRes] = await Promise.all([
        api.get('/admin/workouts/pending'),
        api.get('/admin/exercises/pending')
      ]);
      setPendingWorkouts(workoutsRes.data);
      setPendingExercises(exercisesRes.data);
    } catch (error) {
      console.error('Error fetching pending content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorkout = async (workoutId) => {
    try {
      await api.put(`/admin/workouts/${workoutId}/approve`);
      fetchPendingContent();
    } catch (error) {
      console.error('Error approving workout:', error);
      alert('Failed to approve workout');
    }
  };

  const handleRejectWorkout = async (workoutId) => {
    if (window.confirm('Are you sure you want to reject this workout?')) {
      try {
        await api.put(`/admin/workouts/${workoutId}/reject`);
        fetchPendingContent();
      } catch (error) {
        console.error('Error rejecting workout:', error);
        alert('Failed to reject workout');
      }
    }
  };

  const handleApproveExercise = async (exerciseId) => {
    try {
      await api.put(`/admin/exercises/${exerciseId}/approve`);
      fetchPendingContent();
    } catch (error) {
      console.error('Error approving exercise:', error);
      alert('Failed to approve exercise');
    }
  };

  const handleRejectExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to reject this exercise?')) {
      try {
        await api.put(`/admin/exercises/${exerciseId}/reject`);
        fetchPendingContent();
      } catch (error) {
        console.error('Error rejecting exercise:', error);
        alert('Failed to reject exercise');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="content-management card">
      <h2>Content Management</h2>

      <div className="content-tabs">
        <button
          className={`tab-button ${activeTab === 'workouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('workouts')}
        >
          Pending Workouts ({pendingWorkouts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          Pending Exercises ({pendingExercises.length})
        </button>
      </div>

      {activeTab === 'workouts' && (
        <div className="pending-content">
          {pendingWorkouts.length === 0 ? (
            <p className="no-data">No pending workouts</p>
          ) : (
            <div className="content-list">
              {pendingWorkouts.map(workout => (
                <div key={workout._id} className="content-item">
                  <div className="content-info">
                    <h3>{workout.title}</h3>
                    <p>By: {workout.userId?.name || workout.userId?.email}</p>
                    <p>Created: {format(new Date(workout.createdAt), 'MMM dd, yyyy')}</p>
                    {workout.description && <p>{workout.description}</p>}
                  </div>
                  <div className="content-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApproveWorkout(workout._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectWorkout(workout._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="pending-content">
          {pendingExercises.length === 0 ? (
            <p className="no-data">No pending exercises</p>
          ) : (
            <div className="content-list">
              {pendingExercises.map(exercise => (
                <div key={exercise._id} className="content-item">
                  <div className="content-info">
                    <h3>{exercise.name}</h3>
                    <p>By: {exercise.createdBy?.name || exercise.createdBy?.email}</p>
                    <p>Created: {format(new Date(exercise.createdAt), 'MMM dd, yyyy')}</p>
                    {exercise.description && <p>{exercise.description}</p>}
                    <p>Section: {exercise.section?.name}</p>
                    <p>Difficulty: {exercise.difficulty}</p>
                  </div>
                  <div className="content-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApproveExercise(exercise._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectExercise(exercise._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentManagement;

