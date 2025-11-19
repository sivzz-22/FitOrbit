import mongoose from 'mongoose';

const workoutSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a workout title']
  },
  description: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Flexibility', 'Mixed'],
    default: 'Mixed'
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutSection'
  }],
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      default: 3
    },
    reps: {
      type: Number,
      default: 10
    },
    weight: {
      type: Number,
      default: 0
    },
    rpe: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    },
    restTime: {
      type: Number,
      default: 90
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  estimatedDuration: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  notes: {
    type: String,
    default: ''
  },
  calories: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  approvedByAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;

