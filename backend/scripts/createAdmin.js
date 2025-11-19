import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const { name, email, password } = process.argv.slice(2).reduce((acc, arg, i, arr) => {
      if (arg === '--name' && arr[i + 1]) acc.name = arr[i + 1];
      if (arg === '--email' && arr[i + 1]) acc.email = arr[i + 1];
      if (arg === '--password' && arr[i + 1]) acc.password = arr[i + 1];
      return acc;
    }, {});

    if (!name || !email || !password) {
      console.log('Usage: node scripts/createAdmin.js --name "Admin Name" --email "admin@example.com" --password "password123"');
      process.exit(1);
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      userExists.role = 'admin';
      await userExists.save();
      console.log(`✅ User ${email} updated to admin role`);
    } else {
      const admin = await User.create({
        name,
        email,
        password,
        role: 'admin'
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();

