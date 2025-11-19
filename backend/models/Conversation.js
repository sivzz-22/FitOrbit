import mongoose from 'mongoose';

const conversationSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'community'],
    default: 'direct'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    trim: true
  },
  gymOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Object,
    default: {}
  },
  joinCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

conversationSchema.index({ members: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;


