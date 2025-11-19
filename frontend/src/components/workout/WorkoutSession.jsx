import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../common/Loading';
import './WorkoutSession.css';

const WorkoutSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [session, setSession] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [setData, setSetData] = useState({ reps: 0, weight: 0, rpe: 7 });
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchWorkout();
    createOrFetchSession();
  }, [id]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const createOrFetchSession = async () => {
    try {
      // Try to get active session first
      const response = await api.get('/workout-sessions/active');
      setSession(response.data.session);
    } catch (error) {
      // No active session, create one
      try {
        const startResponse = await api.post(`/workouts/${id}/start`);
        if (startResponse.data.session) {
          setSession(startResponse.data.session);
        }
      } catch (err) {
        console.error('Error creating session:', err);
      }
    }
  };

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workouts/${id}`);
      const workoutData = response.data;
      setWorkout(workoutData);
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        const firstEx = workoutData.exercises[0];
        const exercise = firstEx.exerciseId || firstEx;
        setSetData({
          reps: firstEx.reps || exercise.defaultReps || 0,
          weight: firstEx.weight || 0,
          rpe: firstEx.rpe || 7
        });
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSet = async () => {
    if (!workout || !workout.exercises[currentExerciseIndex]) return;

    const exercise = workout.exercises[currentExerciseIndex];
    const exerciseId = exercise.exerciseId?._id || exercise.exerciseId;
    const setNumber = currentSetIndex + 1;

    try {
      if (session) {
        await api.post(`/workout-sessions/${session._id}/complete-set`, {
          exerciseId,
          setNumber,
          reps: setData.reps,
          weight: setData.weight,
          rpe: setData.rpe
        });
      }

      // Move to next set
      if (currentSetIndex < exercise.sets - 1) {
        setCurrentSetIndex(currentSetIndex + 1);
      } else {
        // Move to next exercise
        if (currentExerciseIndex < workout.exercises.length - 1) {
          const nextIndex = currentExerciseIndex + 1;
          setCurrentExerciseIndex(nextIndex);
          setCurrentSetIndex(0);
          const nextEx = workout.exercises[nextIndex];
          const nextExerciseData = nextEx.exerciseId || nextEx;
          setSetData({
            reps: nextEx.reps || nextExerciseData.defaultReps || 0,
            weight: nextEx.weight || 0,
            rpe: nextEx.rpe || 7
          });
        } else {
          // Workout complete
          await handleCompleteWorkout();
        }
      }
    } catch (error) {
      console.error('Error completing set:', error);
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSetIndex(0);
      const nextEx = workout.exercises[nextIndex];
      const nextExerciseData = nextEx.exerciseId || {};
      setSetData({
        reps: nextEx.reps || nextExerciseData.defaultReps || 0,
        weight: nextEx.weight || 0,
        rpe: nextEx.rpe || 7
      });
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      if (session) {
        await api.put(`/workout-sessions/${session._id}/complete`);
      }
      await api.put(`/workouts/${id}/complete`);
      navigate('/workouts');
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  if (loading || !workout) {
    return <Loading />;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  if (!currentExercise) {
    return <div>No exercises in this workout</div>;
  }

  const exercise = currentExercise.exerciseId || {};
  const exerciseName = exercise.name || 'Exercise';
  const totalExercises = workout.exercises.length;
  const totalSets = currentExercise.sets || 0;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="workout-session">
      <div className="session-header">
        <button className="btn-back" onClick={() => navigate('/workouts')}>
          ← Back to Workouts
        </button>
        <div className="session-header-top">
          <div>
            <h1>{exerciseName}</h1>
            <p className="exercise-counter">Exercise {currentExerciseIndex + 1} of {totalExercises}</p>
          </div>
          <div className="stopwatch-container">
            <div className="stopwatch">
              <span className="stopwatch-icon">⏱</span>
              <span className="stopwatch-time">{formatTime(timeElapsed)}</span>
            </div>
            <button
              className="btn btn-secondary btn-sm stopwatch-control"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </div>

      <div className="current-set-card">
        <h2>{exerciseName}</h2>
        <p className="set-counter">Set {currentSetIndex + 1} of {totalSets}</p>

        <div className="set-params">
          <div className="param-card">
            <label>Sets</label>
            <div className="param-value">{totalSets}</div>
          </div>
          <div className="param-card">
            <label>Reps</label>
            <input
              type="number"
              value={setData.reps}
              onChange={(e) => setSetData({ ...setData, reps: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="param-card">
            <label>Weight (lbs)</label>
            <input
              type="number"
              value={setData.weight}
              onChange={(e) => setSetData({ ...setData, weight: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="param-card">
            <label>RPE (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={setData.rpe}
              onChange={(e) => setSetData({ ...setData, rpe: parseFloat(e.target.value) || 7 })}
            />
          </div>
        </div>

        <div className="set-actions">
          <button className="btn btn-primary btn-large" onClick={handleCompleteSet}>
            ✓ Complete Set
          </button>
          <button className="btn btn-secondary" onClick={handleSkipExercise}>
            Skip Exercise
          </button>
        </div>
      </div>

      <div className="workout-progress">
        <h3>Workout Progress</h3>
        <div className="progress-list">
            {workout.exercises.map((ex, idx) => {
              const exData = ex.exerciseId || {};
              const exName = exData.name || 'Exercise';
              const isCurrent = idx === currentExerciseIndex;
              const isCompleted = idx < currentExerciseIndex;
              
              return (
                <div key={idx} className={`progress-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="progress-item-header">
                    <span>{exName}</span>
                    {isCurrent && <span className="current-badge">Current</span>}
                    {isCompleted && <span className="completed-badge">✓</span>}
                  </div>
                  <div className="progress-item-details">
                    {isCurrent ? (
                      <span>{currentSetIndex}/{ex.sets || 0} sets completed</span>
                    ) : (
                      <span>{isCompleted ? `${ex.sets || 0}/${ex.sets || 0} sets completed` : `0/${ex.sets || 0} sets completed`}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;

