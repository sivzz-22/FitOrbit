import Metrics from '../models/Metrics.js';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// @desc    Create metrics entry
// @route   POST /api/metrics
// @access  Private
export const createMetrics = async (req, res) => {
  try {
    const { date, calories, steps, waterIntake, sleepHours, notes } = req.body;

    if (
      calories === undefined ||
      steps === undefined ||
      waterIntake === undefined ||
      sleepHours === undefined
    ) {
      return res.status(400).json({ message: 'Calories, steps, water intake, and sleep hours are required' });
    }

    const entryDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());
    const existing = await Metrics.findOne({
      userId: req.user._id,
      date: { $gte: entryDate, $lt: endOfDay(entryDate) }
    });

    if (existing) {
      return res.status(400).json({ message: 'Metrics entry already exists for this date' });
    }

    const metrics = await Metrics.create({
      userId: req.user._id,
      date: entryDate,
      calories,
      steps,
      waterIntake,
      sleepHours,
      notes
    });

    res.status(201).json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get metrics
// @route   GET /api/metrics
// @access  Private
export const getMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = subDays(new Date(), parseInt(days));

    const metrics = await Metrics.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get metrics history with date range
// @route   GET /api/metrics/history
// @access  Private
export const getMetricsHistory = async (req, res) => {
  try {
    const { startDate, endDate, days } = req.query;

    let query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate))
      };
    } else if (days) {
      const start = subDays(new Date(), parseInt(days));
      query.date = { $gte: start };
    } else {
      // Default to last 30 days
      const start = subDays(new Date(), 30);
      query.date = { $gte: start };
    }

    const metrics = await Metrics.find(query).sort({ date: 1 });

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update metrics
// @route   PUT /api/metrics/:id
// @access  Private
export const updateMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!metrics) {
      return res.status(404).json({ message: 'Metrics not found' });
    }

    const { calories, steps, waterIntake, sleepHours, notes, date } = req.body;

    if (calories !== undefined) metrics.calories = calories;
    if (steps !== undefined) metrics.steps = steps;
    if (waterIntake !== undefined) metrics.waterIntake = waterIntake;
    if (sleepHours !== undefined) metrics.sleepHours = sleepHours;
    if (notes !== undefined) metrics.notes = notes;
    if (date) metrics.date = startOfDay(new Date(date));

    const updatedMetrics = await metrics.save();
    res.json(updatedMetrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get metrics dashboard summary + entries
// @route   GET /api/metrics/dashboard
// @access  Private
export const getMetricsDashboard = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const range = Math.max(1, parseInt(days));
    const startDate = subDays(new Date(), range);

    const entries = await Metrics.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const latest = entries[entries.length - 1] || null;

    const base = { calories: 0, steps: 0, waterIntake: 0, sleepHours: 0 };
    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        steps: acc.steps + (entry.steps || 0),
        waterIntake: acc.waterIntake + (entry.waterIntake || 0),
        sleepHours: acc.sleepHours + (entry.sleepHours || 0)
      }),
      base
    );

    const averages = entries.length
      ? {
          calories: totals.calories / entries.length,
          steps: totals.steps / entries.length,
          waterIntake: totals.waterIntake / entries.length,
          sleepHours: totals.sleepHours / entries.length
        }
      : { ...base };

    res.json({
      entries,
      latest,
      averages,
      totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete metrics
// @route   DELETE /api/metrics/:id
// @access  Private
export const deleteMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!metrics) {
      return res.status(404).json({ message: 'Metrics not found' });
    }

    await metrics.deleteOne();
    res.json({ message: 'Metrics removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

