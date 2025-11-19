import Workout from '../models/Workout.js';
import WorkoutSection from '../models/WorkoutSection.js';
import User from '../models/User.js';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      sections,
      exercises,
      estimatedDuration,
      difficulty,
      notes,
      calories,
      date,
      status,
      isTemplate,
      isGlobal
    } = req.body;

    const workout = await Workout.create({
      title,
      description,
      userId: req.user._id,
      category: category || 'Mixed',
      sections: sections || [],
      exercises: exercises || [],
      estimatedDuration: estimatedDuration || 0,
      difficulty: difficulty || 'Beginner',
      notes,
      calories: calories || 0,
      date: date || new Date(),
      status: status || 'scheduled',
      isTemplate: isTemplate || false,
      isGlobal: req.user.role === 'admin' && isGlobal ? true : false,
      approvedByAdmin: req.user.role === 'admin' && isGlobal ? true : false
    });

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('sections')
      .populate('exercises.exerciseId');

    res.status(201).json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workouts
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req, res) => {
  try {
    const { status, isTemplate, date, category } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (date) {
      const start = startOfDay(new Date(date));
      const end = endOfDay(new Date(date));
      query.date = { $gte: start, $lte: end };
    }

    const workouts = await Workout.find(query)
      .populate('sections')
      .populate('exercises.exerciseId')
      .sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's workouts
// @route   GET /api/workouts/today
// @access  Private
export const getTodaysWorkouts = async (req, res) => {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    })
      .populate('sections')
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('sections')
      .populate('exercises.exerciseId');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const {
      title,
      description,
      category,
      sections,
      exercises,
      estimatedDuration,
      difficulty,
      notes,
      calories,
      date,
      status,
      isTemplate,
      isGlobal
    } = req.body;

    workout.title = title || workout.title;
    workout.description = description !== undefined ? description : workout.description;
    workout.category = category || workout.category;
    workout.sections = sections !== undefined ? sections : workout.sections;
    workout.exercises = exercises !== undefined ? exercises : workout.exercises;
    workout.estimatedDuration = estimatedDuration !== undefined ? estimatedDuration : workout.estimatedDuration;
    workout.difficulty = difficulty || workout.difficulty;
    workout.notes = notes !== undefined ? notes : workout.notes;
    workout.calories = calories !== undefined ? calories : workout.calories;
    workout.date = date || workout.date;
    workout.status = status || workout.status;
    workout.isTemplate = isTemplate !== undefined ? isTemplate : workout.isTemplate;
    
    if (req.user.role === 'admin' && isGlobal !== undefined) {
      workout.isGlobal = isGlobal;
      workout.approvedByAdmin = isGlobal;
    }

    const updatedWorkout = await workout.save();
    const populatedWorkout = await Workout.findById(updatedWorkout._id)
      .populate('sections')
      .populate('exercises.exerciseId');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete workout
// @route   PUT /api/workouts/:id/complete
// @access  Private
export const completeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.status = 'completed';

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalWorkouts += 1;
    
    // Calculate average calories
    const completedWorkouts = await Workout.find({
      userId: req.user._id,
      status: 'completed',
      calories: { $gt: 0 }
    });
    
    if (completedWorkouts.length > 0) {
      const totalCalories = completedWorkouts.reduce((sum, w) => sum + w.calories, 0);
      user.avgCalories = Math.round(totalCalories / completedWorkouts.length);
    }
    
    user.lastWorkoutDate = new Date();
    await user.save();

    const updatedWorkout = await workout.save();
    const populatedWorkout = await Workout.findById(updatedWorkout._id)
      .populate('sections')
      .populate('exercises.exerciseId');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start workout session
// @route   POST /api/workouts/:id/start
// @access  Private
export const startWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.status = 'in-progress';
    await workout.save();

    // Check if session already exists
    const WorkoutSession = (await import('../models/WorkoutSession.js')).default;
    let session = await WorkoutSession.findOne({
      workoutId: workout._id,
      userId: req.user._id,
      status: 'in-progress'
    });

    if (!session) {
      session = await WorkoutSession.create({
        workoutId: workout._id,
        userId: req.user._id,
        status: 'in-progress'
      });
    }

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('sections')
      .populate('exercises.exerciseId');

    res.json({ workout: populatedWorkout, session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

