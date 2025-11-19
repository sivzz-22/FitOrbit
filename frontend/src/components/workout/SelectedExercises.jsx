import { useState, useEffect } from 'react';
import api from '../../services/api';
import './SelectedExercises.css';

const SelectedExercises = ({ exercises, onUpdate, onRemove }) => {
  const [exerciseDetails, setExerciseDetails] = useState({});

  useEffect(() => {
    fetchExerciseDetails();
  }, [exercises]);

  const fetchExerciseDetails = async () => {
    const details = {};
    for (const ex of exercises) {
      const exerciseId = ex.exerciseId?._id || ex.exerciseId;
      if (exerciseId && !exerciseDetails[exerciseId]) {
        try {
          const response = await api.get(`/exercises/${exerciseId}`);
          details[exerciseId] = response.data;
        } catch (error) {
          console.error('Error fetching exercise:', error);
        }
      }
    }
    setExerciseDetails(prev => ({ ...prev, ...details }));
  };

  const handleChange = (index, field, value) => {
    const updated = { ...exercises[index] };
    updated[field] = field === 'weight' || field === 'sets' || field === 'reps' || field === 'restTime' || field === 'rpe'
      ? parseFloat(value) || 0
      : value;
    onUpdate(index, updated);
  };

  if (exercises.length === 0) {
    return (
      <div className="selected-exercises-empty">
        <p>No exercises added yet. Select exercises from the right panel.</p>
      </div>
    );
  }

  return (
    <div className="selected-exercises">
      <h4>Selected Exercises ({exercises.length})</h4>
      <div className="selected-exercises-list">
        {exercises.map((exercise, index) => {
          const exerciseId = exercise.exerciseId?._id || exercise.exerciseId;
          const details = exerciseDetails[exerciseId];
          return (
            <div key={index} className="selected-exercise-card">
              <div className="exercise-card-header">
                <h5>{details?.name || 'Loading...'}</h5>
                <button
                  className="btn-remove"
                  onClick={() => onRemove(index)}
                  title="Remove exercise"
                >
                  ×
                </button>
              </div>

              <div className="exercise-params">
                <div className="param-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => handleChange(index, 'sets', e.target.value)}
                  />
                </div>

                <div className="param-group">
                  <label>Reps</label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.reps}
                    onChange={(e) => handleChange(index, 'reps', e.target.value)}
                  />
                </div>

                <div className="param-group">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={exercise.weight}
                    onChange={(e) => handleChange(index, 'weight', e.target.value)}
                  />
                </div>

                <div className="param-group">
                  <label>RPE (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={exercise.rpe}
                    onChange={(e) => handleChange(index, 'rpe', e.target.value)}
                  />
                </div>

                <div className="param-group">
                  <label>Rest Time (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={exercise.restTime}
                    onChange={(e) => handleChange(index, 'restTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedExercises;

