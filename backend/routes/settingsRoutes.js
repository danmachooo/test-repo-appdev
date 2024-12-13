const express = require('express');
const settingController = require('../controllers/settingsController');

const router = express.Router();

router.get('/get', settingController.getSettings);
router.post('/save', settingController.saveSettings);

module.exports = router;