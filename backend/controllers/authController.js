// controllers/authController.js
const authService = require('../services/authService');

exports.voucherLogin = async (req, res) => {
  const { voucher } = req.body;

  try {
    await authService.verifyVoucher(voucher);
    res.status(200).json({ message: 'Voucher validated. Please set a password.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.setPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await authService.setPassword(email, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await authService.authenticate(email, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.hasAdmin = async (req, res) => {
  try {
    const adminWithNullPassword = await authService.hasAdmin();
    res.status(200).json({hasAdminWithNullPassword: !!adminWithNullPassword});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};