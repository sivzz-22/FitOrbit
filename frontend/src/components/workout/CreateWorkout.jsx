import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ExerciseSelector from './ExerciseSelector';
import SelectedExercises from './SelectedExercises';
import Loading from '../common/Loading';
import './CreateWorkout.css';

const CreateWorkout = ({ workoutId, exerciseId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Strength',
    exercises: [],
    estimatedDuration: 0,
    difficulty: 'Beginner',
    sections: [],
    notes: '',
    isTemplate: false
  });
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [error, setError] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastExerciseIdRef = useRef(null);

  useEffect(() => {
    fetchSections();
    if (workoutId) {
      fetchWorkout();
    } else {
      const storedDraft = localStorage.getItem('workoutDraft');
      if (storedDraft) {
        try {
          const parsedDraft = JSON.parse(storedDraft);
          setFormData(prev => ({
            ...prev,
            ...parsedDraft,
            exercises: parsedDraft.exercises || [],
            sections: parsedDraft.sections || []
          }));
        } catch (err) {
          console.warn('Unable to parse workout draft:', err);
        }
      }
      setIsInitialized(true);
    }
  }, [workoutId]);

  useEffect(() => {
    if (!workoutId && isInitialized) {
      localStorage.setItem('workoutDraft', JSON.stringify(formData));
    }
  }, [formData, workoutId, isInitialized]);

  useEffect(() => {
    if (!exerciseId || !isInitialized) {
      return;
    }
    if (lastExerciseIdRef.current === exerciseId) {
      return;
    }
    fetchExerciseAndAdd(exerciseId);
  }, [exerciseId, isInitialized]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workouts/${workoutId}`);
      setWorkout(response.data);
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        category: response.data.category || 'Strength',
        exercises: response.data.exercises || [],
        estimatedDuration: response.data.estimatedDuration || 0,
        difficulty: response.data.difficulty || 'Beginner',
        sections: response.data.sections?.map(section => section._id) || [],
        notes: response.data.notes || '',
        isTemplate: response.data.isTemplate || false
      });
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setIsInitialized(true);
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get('/sections');
      setAvailableSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchExerciseAndAdd = async (exerciseToAddId) => {
    try {
      const response = await api.get(`/exercises/${exerciseToAddId}`);
      handleAddExercise(response.data);
      lastExerciseIdRef.current = exerciseToAddId;
      clearExerciseQueryParam();
    } catch (error) {
      console.error('Error fetching exercise:', error);
    }
  };

  const clearExerciseQueryParam = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('exercise')) {
      params.delete('exercise');
      const search = params.toString();
      navigate(
        {
          pathname: window.location.pathname,
          search: search ? `?${search}` : ''
        },
        { replace: true }
      );
      lastExerciseIdRef.current = null;
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const toggleSection = (sectionId) => {
    setFormData(prev => {
      const exists = prev.sections.includes(sectionId);
      return {
        ...prev,
        sections: exists
          ? prev.sections.filter(id => id !== sectionId)
          : [...prev.sections, sectionId]
      };
    });
  };

  const handleAddExercise = (exercise) => {
    setFormData(prev => {
      const exerciseData = {
        exerciseId: exercise._id,
        sets: exercise.defaultSets || 3,
        reps: exercise.defaultReps || 10,
        weight: 0,
        rpe: 7,
        restTime: 90,
        order: prev.exercises.length
      };
      return {
        ...prev,
        exercises: [...prev.exercises, exerciseData]
      };
    });
    setShowExerciseSelector(false);
  };

  const handleUpdateExercise = (index, updatedExercise) => {
    setFormData(prev => {
      const newExercises = [...prev.exercises];
      newExercises[index] = updatedExercise;
      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  const handleRemoveExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const clearDraftState = () => {
    if (!workoutId) {
      localStorage.removeItem('workoutDraft');
    }
  };

  const handleCancel = () => {
    clearDraftState();
    onCancel();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedDuration: calculateDuration()
      };

      if (workoutId) {
        await api.put(`/workouts/${workoutId}`, payload);
      } else {
        await api.post('/workouts', payload);
      }

      clearDraftState();
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    // Rough estimate: 2 minutes per set + rest time
    return formData.exercises.reduce((total, ex) => {
      return total + (ex.sets * 2) + (ex.restTime * ex.sets / 60);
    }, 0);
  };

  if (loading && workoutId) {
    return <Loading />;
  }

  return (
    <div className="create-workout-container">
      <div className="create-workout-header">
        <h2>{workoutId ? 'Edit Workout' : 'Create New Workout'}</h2>
        <button className="btn-close" onClick={handleCancel}>×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-workout-form">
        <div className="create-workout-panels">
          <div className="workout-details-panel">
            <h3>Workout Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Workout Name</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Morning Push-up"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Workout Sections</label>
              {availableSections.length === 0 ? (
                <p className="helper-text">
                  No sections yet. Use the Add Section button on the dashboard to create custom tags.
                </p>
              ) : (
                <div className="section-selector">
                  {availableSections.map(section => (
                    <button
                      type="button"
                      key={section._id}
                      className={`section-pill ${formData.sections.includes(section._id) ? 'selected' : ''}`}
                      style={{ borderColor: section.color }}
                      onClick={() => toggleSection(section._id)}
                    >
                      <span className="section-color" style={{ backgroundColor: section.color }} />
                      {section.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., take 10 push up"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleChange}
                />
                Save as Personal Template
              </label>
            </div>

            <SelectedExercises
              exercises={formData.exercises}
              onUpdate={handleUpdateExercise}
              onRemove={handleRemoveExercise}
            />
          </div>

          <div className="exercise-selector-panel">
            <h3>Add Exercises</h3>
            <ExerciseSelector
              onSelect={handleAddExercise}
              selectedExerciseIds={formData.exercises.map(e => e.exerciseId)}
            />
          </div>
        </div>

        <div className="create-workout-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || formData.exercises.length === 0}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkout;

