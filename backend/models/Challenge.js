import mongoose from 'mongoose';

const participantSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, { _id: false });

const challengeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  deadline: {
    type: Date
  },
  reward: {
    type: String
  },
  participants: [participantSchema]
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;


