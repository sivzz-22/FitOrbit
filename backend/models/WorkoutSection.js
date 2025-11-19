import mongoose from 'mongoose';

const workoutSectionSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a section name'],
    trim: true
  },
  color: {
    type: String,
    default: '#3498db'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isGlobal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const WorkoutSection = mongoose.model('WorkoutSection', workoutSectionSchema);

export default WorkoutSection;

