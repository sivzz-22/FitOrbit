import mongoose from 'mongoose';

const metricsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  steps: {
    type: Number,
    required: true,
    min: 0
  },
  waterIntake: {
    type: Number,
    required: true,
    min: 0
  },
  sleepHours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

const Metrics = mongoose.model('Metrics', metricsSchema);

export default Metrics;

