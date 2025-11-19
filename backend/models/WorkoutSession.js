import mongoose from 'mongoose';

const workoutSessionSchema = mongoose.Schema({
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentExerciseIndex: {
    type: Number,
    default: 0
  },
  currentSetIndex: {
    type: Number,
    default: 0
  },
  completedSets: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    setNumber: Number,
    reps: Number,
    weight: Number,
    rpe: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

export default WorkoutSession;

