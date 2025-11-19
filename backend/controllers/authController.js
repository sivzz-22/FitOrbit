import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sanitizeUsername = (value) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
};

const generateUniqueUsername = async (preferred, fallback) => {
  let base = sanitizeUsername(preferred) || sanitizeUsername(fallback) || `user${Date.now()}`;
  if (!base) {
    base = `user${Date.now()}`;
  }
  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ usernameLower: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, username, phone, profilePhoto } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const uniqueUsername = await generateUniqueUsername(username || name, email);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      username: uniqueUsername,
      usernameLower: uniqueUsername,
      phone: phone || '',
      profilePhoto: profilePhoto || '',
      themePreference: 'light'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        themePreference: user.themePreference,
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        themePreference: user.themePreference,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

