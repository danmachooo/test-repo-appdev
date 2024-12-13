const Setting = require('../models/Settings');

const settingService = {
  async getSettings() {
    const settings = await Setting.findAll();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  },

  async saveSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await Setting.upsert({ key, value });
    }
    return this.getSettings();
  }
};

module.exports = settingService;