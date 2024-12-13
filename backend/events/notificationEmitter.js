const EventEmitter = require('events');
const notificationService = require('../services/notificationServices');

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

notificationEmitter.on('batchAddedOrUpdated', async (data) => {
  console.log(`Event received for batch ${data.batch}. Checking for notifications...`);

  try {
    await notificationService.checkAndCreateNotifications();
    console.log('Notifications processed successfully.');
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
});

notificationEmitter.on('DOMloaded', async (data) => {
  console.log(`Checking for notifications...`);

  try {
    await notificationService.checkAndCreateNotifications();
    console.log('Notifications processed successfully.');
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
});

module.exports = notificationEmitter;