import WorkoutSession from '../models/WorkoutSession.js';
import Workout from '../models/Workout.js';

// @desc    Get active workout session
// @route   GET /api/workout-sessions/active
// @access  Private
export const getActiveSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      userId: req.user._id,
      status: 'in-progress'
    })
      .populate('workoutId')
      .populate('completedSets.exerciseId');

    if (!session) {
      return res.status(404).json({ message: 'No active workout session' });
    }

    const workout = await Workout.findById(session.workoutId)
      .populate('exercises.exerciseId');

    res.json({ session, workout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete a set
// @route   POST /api/workout-sessions/:id/complete-set
// @access  Private
export const completeSet = async (req, res) => {
  try {
    const { exerciseId, setNumber, reps, weight, rpe } = req.body;
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.completedSets.push({
      exerciseId,
      setNumber,
      reps,
      weight,
      rpe,
      completedAt: new Date()
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update session progress
// @route   PUT /api/workout-sessions/:id/progress
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { currentExerciseIndex, currentSetIndex } = req.body;
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.currentExerciseIndex = currentExerciseIndex !== undefined ? currentExerciseIndex : session.currentExerciseIndex;
    session.currentSetIndex = currentSetIndex !== undefined ? currentSetIndex : session.currentSetIndex;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete workout session
// @route   PUT /api/workout-sessions/:id/complete
// @access  Private
export const completeSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'completed';
    session.endTime = new Date();
    await session.save();

    // Update workout status
    const workout = await Workout.findById(session.workoutId);
    if (workout) {
      workout.status = 'completed';
      await workout.save();
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

