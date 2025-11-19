import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const socialPostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  mediaUrls: [{
    type: String
  }],
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  visibility: {
    type: String,
    enum: ['public', 'friends'],
    default: 'public'
  }
}, {
  timestamps: true
});

const SocialPost = mongoose.model('SocialPost', socialPostSchema);

export default SocialPost;


