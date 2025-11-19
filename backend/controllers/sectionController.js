import WorkoutSection from '../models/WorkoutSection.js';
import Workout from '../models/Workout.js';

// @desc    Create a new workout section
// @route   POST /api/sections
// @access  Private
export const createSection = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Check if section with same name exists for user
    const existing = await WorkoutSection.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [
        { userId: req.user._id },
        { userId: null, isGlobal: true }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Section with this name already exists' });
    }

    const section = await WorkoutSection.create({
      name,
      color: color || '#3498db',
      userId: req.user.role === 'admin' && req.body.isGlobal ? null : req.user._id,
      isGlobal: req.user.role === 'admin' && req.body.isGlobal ? true : false
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sections
// @route   GET /api/sections
// @access  Private
export const getSections = async (req, res) => {
  try {
    const sections = await WorkoutSection.find({
      $or: [
        { userId: req.user._id },
        { isGlobal: true }
      ]
    }).sort({ name: 1 });

    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get section by ID
// @route   GET /api/sections/:id
// @access  Private
export const getSectionById = async (req, res) => {
  try {
    const section = await WorkoutSection.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { isGlobal: true }
      ]
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private
export const updateSection = async (req, res) => {
  try {
    const section = await WorkoutSection.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { isGlobal: true, userId: null }
      ]
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Only owner or admin can update
    if (section.userId && section.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, color } = req.body;

    if (name) section.name = name;
    if (color) section.color = color;

    const updatedSection = await section.save();
    res.json(updatedSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private
export const deleteSection = async (req, res) => {
  try {
    const section = await WorkoutSection.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { isGlobal: true, userId: null }
      ]
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Only owner or admin can delete
    if (section.userId && section.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if section is used in workouts
    const workoutsUsingSection = await Workout.findOne({ sections: req.params.id });
    if (workoutsUsingSection) {
      return res.status(400).json({ message: 'Cannot delete section that is used in workouts' });
    }

    await section.deleteOne();
    res.json({ message: 'Section removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get section statistics for pie chart
// @route   GET /api/sections/stats
// @access  Private
export const getSectionStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all user sections and global sections
    const sections = await WorkoutSection.find({
      $or: [
        { userId: req.user._id },
        { isGlobal: true }
      ]
    });

    // Count workouts per section
    const stats = await Promise.all(
      sections.map(async (section) => {
        const count = await Workout.countDocuments({
          userId: req.user._id,
          sections: section._id,
          status: 'completed',
          date: { $gte: startDate }
        });

        return {
          section: section.name,
          color: section.color,
          count
        };
      })
    );

    // Filter out sections with 0 workouts
    const filteredStats = stats.filter(stat => stat.count > 0);

    res.json(filteredStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

