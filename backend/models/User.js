import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
  },
  username: {
    type: String,
    trim: true
  },
  usernameLower: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  height: {
    type: Number,
    default: null
  },
  weight: {
    type: Number,
    default: null
  },
  goals: {
    type: String,
    default: ''
  },
  totalWorkouts: {
    type: Number,
    default: 0
  },
  avgCalories: {
    type: Number,
    default: 0
  },
  lastWorkoutDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  themePreference: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.setUsername = function(username) {
  if (!username) {
    this.username = undefined;
    this.usernameLower = undefined;
    return;
  }
  this.username = username.trim();
  this.usernameLower = this.username.toLowerCase();
};

userSchema.index({ usernameLower: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

export default User;

