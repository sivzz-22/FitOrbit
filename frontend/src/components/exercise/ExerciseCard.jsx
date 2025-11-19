import './ExerciseCard.css';

const ExerciseCard = ({ exercise, onViewDetails, onAddToWorkout }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons
    if (e.target.closest('button')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <div className="exercise-card-modern" onClick={handleCardClick}>
      <div className="exercise-card-content">
        <h3>{exercise.name}</h3>
        <p className="exercise-description">
          {exercise.description || 'No description available'}
        </p>

        <div className="exercise-details">
          <div className="detail-item">
            <strong>Category:</strong> {exercise.category || 'N/A'}
          </div>
          <div className="detail-item">
            <strong>Primary Muscles:</strong> {exercise.targetMuscle || 'N/A'}
          </div>
          <div className="detail-item">
            <strong>Difficulty:</strong>
            <span 
              className="difficulty-badge"
              style={{ color: getDifficultyColor(exercise.difficulty) }}
            >
              {exercise.difficulty}
            </span>
          </div>
          <div className="detail-item">
            <strong>Equipment:</strong> {exercise.equipment || 'None'}
          </div>
        </div>

        <div className="exercise-card-actions">
          <button 
            className="btn btn-primary btn-view-details" 
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails();
              }
            }}
          >
            View Details
          </button>
          {onAddToWorkout && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={(e) => {
                e.stopPropagation();
                onAddToWorkout(exercise);
              }}
            >
              Add to Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
