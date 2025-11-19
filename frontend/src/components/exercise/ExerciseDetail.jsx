import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../common/Loading';
import './ExerciseDetail.css';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exercises/${id}`);
      setExercise(response.data);
    } catch (error) {
      console.error('Error fetching exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWorkout = () => {
    navigate(`/workouts?exercise=${id}`);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  if (loading || !exercise) {
    return <Loading />;
  }

  return (
    <div className="exercise-detail-page">
      <div className="exercise-detail-header">
        <button className="btn-back" onClick={() => navigate('/exercises')}>
          ← Browse More Exercises
        </button>
        <div>
          <h1>{exercise.name}</h1>
          <p className="exercise-description-main">
            {exercise.description || 'No description available'}
          </p>
        </div>
      </div>

      {exercise.demoVideo && (
        <div className="exercise-video-section">
          <video controls className="exercise-video">
            <source src={exercise.demoVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <div className="exercise-detail-content">
        <div className="exercise-main-info">
          <div className="exercise-info-section">
            <h3>Exercise Information</h3>
            <div className="info-tags">
              <span className="info-tag category-tag">{exercise.category}</span>
              <span 
                className="info-tag difficulty-tag"
                style={{ backgroundColor: getDifficultyColor(exercise.difficulty) + '20', color: getDifficultyColor(exercise.difficulty) }}
              >
                {exercise.difficulty}
              </span>
              <span className="info-tag">{exercise.targetMuscle || 'N/A'}</span>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <>
                  {exercise.secondaryMuscles.map((muscle, idx) => (
                    <span key={idx} className="info-tag">{muscle}</span>
                  ))}
                </>
              )}
              <span className="info-tag">{exercise.equipment || 'Bodyweight'}</span>
            </div>
          </div>

          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="exercise-info-section">
              <h3>How to Perform?</h3>
              <ol className="instructions-list">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {exercise.proTips && exercise.proTips.length > 0 && (
            <div className="exercise-info-section">
              <div className="section-header-toggle" onClick={() => setShowTips(!showTips)}>
                <h3>Pro Tips</h3>
                <span className="toggle-icon">{showTips ? '▲' : '▼'}</span>
              </div>
              {showTips && (
                <ul className="tips-list">
                  {exercise.proTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="exercise-sidebar">
          {exercise.variations && exercise.variations.length > 0 && (
            <div className="sidebar-section">
              <h4>Variations</h4>
              {exercise.variations.map((variation, idx) => (
                <div key={idx} className="variation-item">
                  <strong>{variation.name}</strong>
                  <p>{variation.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="sidebar-section">
            <h4>Quick Reference</h4>
            <div className="quick-ref">
              <div className="ref-item">
                <strong>Category:</strong> {exercise.category}
              </div>
              <div className="ref-item">
                <strong>Difficulty:</strong> {exercise.difficulty}
              </div>
              <div className="ref-item">
                <strong>Primary Muscles:</strong> {exercise.targetMuscle || 'N/A'}
              </div>
              {exercise.variations && (
                <div className="ref-item">
                  <strong>Variations:</strong> {exercise.variations.length}
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-primary btn-full-width" onClick={handleAddToWorkout}>
            Add to Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;

