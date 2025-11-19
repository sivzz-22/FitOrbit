import mongoose from 'mongoose';

const friendRequestSchema = mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

friendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;


