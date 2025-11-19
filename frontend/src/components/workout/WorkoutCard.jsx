import './WorkoutCard.css';

const WorkoutCard = ({ workout, onStart, onEdit, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Strength': '#ef4444',
      'Cardio': '#10b981',
      'Flexibility': '#3b82f6',
      'Mixed': '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  const exerciseCount = workout.exercises?.length || 0;
  const estimatedDuration = workout.estimatedDuration || 0;

  return (
    <div className="workout-card">
      <div className="workout-card-header">
        <h3>{workout.title}</h3>
        <span 
          className="category-badge"
          style={{ backgroundColor: getCategoryColor(workout.category) }}
        >
          {workout.category}
        </span>
      </div>
      
      {workout.description && (
        <p className="workout-description">{workout.description}</p>
      )}

      <div className="workout-stats">
        <span className="stat-item">
          <strong>Exercises:</strong> {exerciseCount}
        </span>
        {estimatedDuration > 0 && (
          <span className="stat-item">
            <strong>Duration:</strong> ~{estimatedDuration} min
          </span>
        )}
      </div>

      <div className="workout-card-actions">
        <button className="btn-icon" onClick={onEdit} title="Edit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button className="btn btn-primary btn-sm" onClick={onStart}>
          Start
        </button>
        <button className="btn-icon btn-icon-danger" onClick={onDelete} title="Delete">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WorkoutCard;

