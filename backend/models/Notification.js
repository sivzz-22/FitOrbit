import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['friend', 'challenge', 'post', 'system', 'message'],
    default: 'system'
  },
  title: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  payload: {
    type: Object,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;


