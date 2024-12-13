// services/authService.js
const Admin = require('../models/Admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.verifyVoucher = async (voucher) => {
  const admin = await Admin.findOne({ where: { voucher } });
  if (!admin) {
    throw new Error('Invalid voucher.');
  }

  // Invalidate the voucher after successful verification
  admin.voucher = null;
  await admin.save();
  return admin;
};

exports.setPassword = async (email, password) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) {
    throw new Error('Admin not found.');
  }

  // Hash the password and update the admin record
  admin.password = await bcrypt.hash(password, 10);
  await admin.save();
  return { message: 'Password set successfully.' };
};

exports.authenticate = async (email, password) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) {
    throw new Error('Invalid credentials.');
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials.');
  }

  // Generate JWT token
  const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
    expiresIn: '1d',
  });

  return { token, message: 'Login successful.' };
};


exports.hasAdmin = async () => {
  try {
    const admin = await Admin.findOne({
      where: {
        password: null // Check if password is null
      }
    });

    // If an admin with a null password exists, return true, otherwise false
    return admin;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Rethrow the error if something goes wrong
  }
};
