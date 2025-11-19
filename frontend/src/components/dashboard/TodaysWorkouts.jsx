import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import './TodaysWorkouts.css';

const TodaysWorkouts = ({ workouts, onUpdate }) => {
  const navigate = useNavigate();

  const handleQuickStart = (workoutId) => {
    navigate(`/workout-session/${workoutId}`);
  };

  const handleEdit = (workoutId) => {
    navigate(`/workouts?edit=${workoutId}`);
  };

  return (
    <div className="todays-workouts card">
      <h2>Today's Workouts</h2>
      {workouts.length === 0 ? (
        <p className="no-workouts">No workouts scheduled for today.</p>
      ) : (
        <div className="workouts-list">
          {workouts.map(workout => (
            <div key={workout._id} className="workout-item">
              <div className="workout-info">
                <h3>{workout.title}</h3>
                <p className="workout-details">
                  {workout.sections?.map(s => s.name).join(', ') || 'No sections'}
                  {workout.duration > 0 && ` • ${workout.duration} min`}
                  {workout.calories > 0 && ` • ${workout.calories} cal`}
                </p>
                <span className={`status-badge ${workout.status}`}>
                  {workout.status}
                </span>
              </div>
              <div className="workout-actions">
                {workout.status === 'scheduled' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleQuickStart(workout._id)}
                  >
                    Quick Start
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(workout._id)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaysWorkouts;

