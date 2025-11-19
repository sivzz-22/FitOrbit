import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../common/Loading';
import './ExerciseSelector.css';

const ExerciseSelector = ({ onSelect, selectedExerciseIds = [] }) => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, search, categoryFilter]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exercises?isGlobal=true');
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises.filter(ex => 
      !selectedExerciseIds.includes(ex._id)
    );

    if (search) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    setFilteredExercises(filtered);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="exercise-selector">
      <div className="exercise-selector-header">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-select"
        >
          <option>All Categories</option>
          <option>Strength</option>
          <option>Cardio</option>
          <option>Flexibility</option>
          <option>Mixed</option>
        </select>
      </div>

      <div className="exercise-list">
        {filteredExercises.length === 0 ? (
          <div className="no-exercises">
            <p>No exercises found. {search && 'Try a different search term.'}</p>
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <div key={exercise._id} className="exercise-item">
              <div className="exercise-item-content">
                {exercise.demoImage && (
                  <img src={exercise.demoImage} alt={exercise.name} className="exercise-thumb" />
                )}
                <div className="exercise-item-info">
                  <h4>{exercise.name}</h4>
                  <p>{exercise.description || 'No description available'}</p>
                  <div className="exercise-tags">
                    {exercise.category && (
                      <span className="tag">{exercise.category}</span>
                    )}
                    {exercise.targetMuscle && (
                      <span className="tag">{exercise.targetMuscle}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-add-exercise"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(exercise);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseSelector;

