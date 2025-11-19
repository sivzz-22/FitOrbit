import Workout from '../models/Workout.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from 'date-fns';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    // Today's calories
    const todayWorkouts = await Workout.find({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const todayCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    // Week's calories
    const weekWorkouts = await Workout.find({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: weekStart, $lte: weekEnd }
    });
    const weekCalories = weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    // Today's workout count
    const todayWorkoutCount = await Workout.countDocuments({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // Week's workout count
    const weekWorkoutCount = await Workout.countDocuments({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: weekStart, $lte: weekEnd }
    });

    res.json({
      calories: {
        today: todayCalories,
        week: weekCalories
      },
      workouts: {
        today: todayWorkoutCount,
        week: weekWorkoutCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get calories chart data
// @route   GET /api/dashboard/calories-chart
// @access  Private
export const getCaloriesChart = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = subDays(new Date(), parseInt(days));

    const workouts = await Workout.find({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: startDate },
      calories: { $gt: 0 }
    }).sort({ date: 1 });

    // Group by date
    const caloriesByDate = {};
    workouts.forEach(workout => {
      const dateKey = workout.date.toISOString().split('T')[0];
      if (!caloriesByDate[dateKey]) {
        caloriesByDate[dateKey] = 0;
      }
      caloriesByDate[dateKey] += workout.calories;
    });

    // Convert to array format
    const chartData = Object.keys(caloriesByDate).map(date => ({
      date,
      calories: caloriesByDate[date]
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

