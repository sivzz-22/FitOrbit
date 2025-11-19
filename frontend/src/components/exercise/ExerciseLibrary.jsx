import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ExerciseCard from './ExerciseCard';
import Loading from '../common/Loading';
import './ExerciseLibrary.css';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [muscleFilter, setMuscleFilter] = useState('All Muscles');

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exercises, search, categoryFilter, muscleFilter]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      // Fetch all exercises (user's + approved global)
      const response = await api.get('/exercises');
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setExercises([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exercises];

    if (search) {
      filtered = filtered.filter(ex =>
        ex.name?.toLowerCase().includes(search.toLowerCase()) ||
        ex.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    if (muscleFilter !== 'All Muscles') {
      filtered = filtered.filter(ex =>
        ex.targetMuscle?.toLowerCase().includes(muscleFilter.toLowerCase()) ||
        ex.secondaryMuscles?.some(m => m.toLowerCase().includes(muscleFilter.toLowerCase()))
      );
    }

    setFilteredExercises(filtered);
  };

  const handleViewDetails = (exerciseId) => {
    navigate(`/exercises/${exerciseId}`);
  };

  const handleAddToWorkout = (exercise) => {
    navigate(`/workouts?exercise=${exercise._id}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="exercise-library-page">
      <div className="exercise-library-header">
        <div>
          <h1>Exercises</h1>
          <p className="exercise-subtitle">Browse and search through our comprehensive and best suit exercises.</p>
        </div>
      </div>

      <div className="exercise-filters-bar">
        <div className="search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option>All Categories</option>
          <option>Strength</option>
          <option>Cardio</option>
          <option>Flexibility</option>
          <option>Mixed</option>
        </select>

        <select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="filter-select"
        >
          <option>All Muscles</option>
          <option>Chest</option>
          <option>Back</option>
          <option>Shoulders</option>
          <option>Forearms</option>
          <option>Biceps</option>
          <option>Triceps</option>
          <option>Legs</option>
          <option>Core</option>
        </select>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="no-exercises">
          <p>No exercises found matching your filters.</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              onViewDetails={() => handleViewDetails(exercise._id)}
              onAddToWorkout={handleAddToWorkout}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
