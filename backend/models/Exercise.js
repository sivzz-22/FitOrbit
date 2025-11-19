import mongoose from 'mongoose';

const exerciseSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name']
  },
  description: {
    type: String,
    default: ''
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutSection',
    required: true
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Flexibility', 'Mixed'],
    default: 'Strength'
  },
  targetMuscle: {
    type: String,
    default: ''
  },
  secondaryMuscles: [{
    type: String
  }],
  equipment: {
    type: String,
    default: 'None'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  instructions: [{
    type: String
  }],
  proTips: [{
    type: String
  }],
  variations: [{
    name: String,
    description: String
  }],
  defaultSets: {
    type: Number,
    default: 3
  },
  defaultReps: {
    type: Number,
    default: 10
  },
  defaultDuration: {
    type: Number,
    default: 0
  },
  demoVideo: {
    type: String,
    default: ''
  },
  demoImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;

