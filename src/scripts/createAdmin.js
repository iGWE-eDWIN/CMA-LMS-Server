require('dotenv').config();



const { connectDB } = require('../db/mongoose');
const User = require('../models/user');

async function createAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

 

    const admin = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      accountStatus: 'active',
      isSuspended: false,
      emailVerified: true,
    });

    console.log('✅ Admin created successfully');
    console.log({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin');
    console.error(error);
    process.exit(1);
  }
}

createAdmin();