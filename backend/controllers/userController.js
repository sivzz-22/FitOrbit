import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Metrics from '../models/Metrics.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Calculate stats
    const stats = {
      totalWorkouts: user.totalWorkouts,
      avgCalories: user.avgCalories,
      lastWorkoutDate: user.lastWorkoutDate
    };

    const profile = user.toObject();
    delete profile.usernameLower;

    res.json({ ...profile, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      name,
      height,
      weight,
      goals,
      username,
      phone,
      profilePhoto,
      themePreference
    } = req.body;

    if (name) user.name = name;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (goals !== undefined) user.goals = goals;

    if (username !== undefined) {
      const trimmed = username.trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Username cannot be empty' });
      }
      const normalized = trimmed.toLowerCase();
      const existing = await User.findOne({
        usernameLower: normalized,
        _id: { $ne: user._id }
      });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = trimmed;
      user.usernameLower = normalized;
    }

    if (phone !== undefined) user.phone = phone;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (themePreference && ['light', 'dark'].includes(themePreference)) {
      user.themePreference = themePreference;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.usernameLower;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export user data
// @route   GET /api/users/export
// @access  Private
export const exportData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const workouts = await Workout.find({ userId: req.user._id });
    const metrics = await Metrics.find({ userId: req.user._id }).sort({ date: 1 });

    // Convert to CSV format
    let csv = 'Data Type,Date,Details\n';
    
    // User info
    csv += `User Profile,,Name: ${user.name}, Email: ${user.email}, Height: ${user.height || 'N/A'}, Weight: ${user.weight || 'N/A'}\n`;
    
    // Workouts
    csv += '\nWorkouts\n';
    csv += 'Title,Date,Status,Calories,Duration,Sets,Reps\n';
    workouts.forEach(workout => {
      csv += `"${workout.title}",${workout.date.toISOString().split('T')[0]},${workout.status},${workout.calories},${workout.duration},${workout.sets},${workout.reps}\n`;
    });
    
    // Metrics
    csv += '\nMetrics\n';
    csv += 'Date,Strength,Endurance,Sleep,Soreness,Energy,Fitness Index\n';
    metrics.forEach(metric => {
      csv += `${metric.date.toISOString().split('T')[0]},${metric.strength},${metric.endurance},${metric.sleep},${metric.soreness},${metric.energy},${metric.fitnessIndex.toFixed(2)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fitorbit-data-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

