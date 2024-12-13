const settingService = require('../services/settingsService');

const settingController = {
  async getSettings(req, res) {
    try {
      const settings = await settingService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
  },

  async saveSettings(req, res) {
    try {
      const updatedSettings = await settingService.saveSettings(req.body);
      res.json({ success: true, data: updatedSettings });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
  }
};

module.exports = settingController;