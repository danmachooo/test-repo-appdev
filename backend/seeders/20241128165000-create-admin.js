'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const voucher = uuidv4(); // Generate a unique voucher
    console.log(`Generated Voucher: ${voucher}`); // Log the voucher for reference

    // Insert the admin into the database
    await queryInterface.bulkInsert('Admins', [
      {
        email: 'mindorostateuniveristyclinic@gmail.com', // Replace with your desired admin email
        password: null, // Password will be set later
        voucher: voucher,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Optional: Send the voucher via email
    const { sendVoucherEmail } = require('../services/emailService');
    try {
      await sendVoucherEmail('mindorostateuniveristyclinic@gmail.com', voucher);
      console.log('Voucher email sent successfully.');
    } catch (error) {
      console.error('Failed to send voucher email:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the admin record if the seeder is reverted
    await queryInterface.bulkDelete('Admins', { email: 'mindorostateuniveristyclinic@gmail.com' });
  },
};
