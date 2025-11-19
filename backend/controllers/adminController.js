import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Exercise from '../models/Exercise.js';
import WorkoutSection from '../models/WorkoutSection.js';
import { subDays } from 'date-fns';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { search, role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending workouts
// @route   GET /api/admin/workouts/pending
// @access  Private/Admin
export const getPendingWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      isGlobal: true,
      approvedByAdmin: false
    })
      .populate('userId', 'name email')
      .populate('sections')
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve workout
// @route   PUT /api/admin/workouts/:id/approve
// @access  Private/Admin
export const approveWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.approvedByAdmin = true;
    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('userId', 'name email')
      .populate('sections');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject workout
// @route   PUT /api/admin/workouts/:id/reject
// @access  Private/Admin
export const rejectWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.isGlobal = false;
    workout.approvedByAdmin = false;
    await workout.save();

    res.json({ message: 'Workout rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending exercises
// @route   GET /api/admin/exercises/pending
// @access  Private/Admin
export const getPendingExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({
      isGlobal: true,
      approvedByAdmin: false
    })
      .populate('createdBy', 'name email')
      .populate('section')
      .sort({ createdAt: -1 });

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve exercise
// @route   PUT /api/admin/exercises/:id/approve
// @access  Private/Admin
export const approveExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    exercise.approvedByAdmin = true;
    await exercise.save();

    const populatedExercise = await Exercise.findById(exercise._id)
      .populate('createdBy', 'name email')
      .populate('section');

    res.json(populatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject exercise
// @route   PUT /api/admin/exercises/:id/reject
// @access  Private/Admin
export const rejectExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    exercise.isGlobal = false;
    exercise.approvedByAdmin = false;
    await exercise.save();

    res.json({ message: 'Exercise rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    // Active users (logged in within last 30 days or have activity)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const activeUsers = await User.countDocuments({
      isActive: true,
      $or: [
        { lastWorkoutDate: { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: thirtyDaysAgo } }
      ]
    });

    // Total users
    const totalUsers = await User.countDocuments({});

    // Popular workouts (most used global templates)
    const popularWorkouts = await Workout.aggregate([
      { $match: { isGlobal: true, approvedByAdmin: true, status: 'completed' } },
      { $group: { _id: '$title', count: { $sum: 1 }, avgCalories: { $avg: '$calories' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Average calories across all users
    const avgCaloriesResult = await User.aggregate([
      { $match: { avgCalories: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$avgCalories' } } }
    ]);
    const avgCalories = avgCaloriesResult.length > 0 ? Math.round(avgCaloriesResult[0].avg) : 0;

    // User growth (users created in last 7, 14, 30 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const fourteenDaysAgo = subDays(new Date(), 14);
    const thirtyDaysAgoDate = subDays(new Date(), 30);

    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const usersLast14Days = await User.countDocuments({ createdAt: { $gte: fourteenDaysAgo } });
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgoDate } });

    // Total workouts completed
    const totalWorkoutsCompleted = await Workout.countDocuments({ status: 'completed' });

    // Total exercises
    const totalExercises = await Exercise.countDocuments({ isGlobal: true, approvedByAdmin: true });

    res.json({
      activeUsers,
      totalUsers,
      popularWorkouts,
      avgCalories,
      userGrowth: {
        last7Days: usersLast7Days,
        last14Days: usersLast14Days,
        last30Days: usersLast30Days
      },
      totalWorkoutsCompleted,
      totalExercises
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

