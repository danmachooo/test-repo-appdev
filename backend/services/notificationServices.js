const { Op, Sequelize } = require('sequelize');
const InventoryItem = require('../models/InventoryItem');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');

const notificationService = {
  async checkAndCreateNotifications() {
    await Promise.all([
      this.checkAndCreateExpiringNotifications(),
      this.checkAndCreateLowStockNotifications(),
      this.checkAndCreateReorderNotifications()
    ]);
  },

  async checkAndCreateExpiringNotifications() {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 30);

    const expiringBatches = await Batch.findAll({
      where: {
        expiry_date: { [Op.lte]: expiryThreshold },
        is_active: true
      },
      include: [{ model: InventoryItem, as: 'inventoryItem' }]
    });

    for (const batch of expiringBatches) {
      const daysUntilExpiry = Math.ceil((batch.expiry_date - new Date()) / (1000 * 60 * 60 * 24));
      const notificationType = daysUntilExpiry <= 0 ? 'EXPIRED' : 'SOON_EXPIRING';

      const existingNotification = await Notification.findOne({
        where: {
          notification_type: notificationType,
          batch_id: batch.id,
          seen: false
        }
      });

      if (!existingNotification) {
        await Notification.create({
          notification_type: notificationType,
          batch_id: batch.id,
          inventory_item_id: batch.inventory_item_id,
          expiry_date: batch.expiry_date,
          title: `${notificationType === 'EXPIRED' ? 'Expired' : 'Soon Expiring'} Batch: ${batch.inventoryItem.name}`,
          message: `Batch ${batch.batch_number} of ${batch.inventoryItem.name} ${notificationType === 'EXPIRED' ? 'has expired' : `will expire in ${daysUntilExpiry} days`} (${batch.expiry_date.toDateString()}).`
        });
      }
    }
  },

  async checkAndCreateLowStockNotifications() {
    const lowStockItems = await InventoryItem.findAll({
      where: {
        quantity_in_stock: { [Op.lte]: Sequelize.col('min_stock_level') },
        is_active: true
      }
    });

    for (const item of lowStockItems) {
      const existingNotification = await Notification.findOne({
        where: {
          notification_type: 'LOW_STOCK',
          inventory_item_id: item.id,
          seen: false
        }
      });

      if (!existingNotification) {
        await Notification.create({
          notification_type: 'LOW_STOCK',
          inventory_item_id: item.id,
          quantity_left: item.quantity_in_stock,
          title: `Low Stock Alert: ${item.name}`,
          message: `The stock level for ${item.name} (${item.quantity_in_stock} units) has fallen below the minimum stock level (${item.min_stock_level} units).`
        });
      }
    }
  },

  async checkAndCreateReorderNotifications() {
    const itemsToReorder = await InventoryItem.findAll({
      where: {
        quantity_in_stock: { [Op.lte]: Sequelize.col('reorder_level') },
        is_active: true
      }
    });

    for (const item of itemsToReorder) {
      const existingNotification = await Notification.findOne({
        where: {
          notification_type: 'REORDER',
          inventory_item_id: item.id,
          seen: false
        }
      });

      if (!existingNotification) {
        await Notification.create({
          notification_type: 'REORDER',
          inventory_item_id: item.id,
          quantity_left: item.quantity_in_stock,
          title: `Reorder Alert: ${item.name}`,
          message: `The stock level for ${item.name} (${item.quantity_in_stock} units) has reached or fallen below the reorder level (${item.reorder_level} units). Please reorder this item.`
        });
      }
    }
  },


  async getFilteredNotifications(type) {
    const whereClause = type ? { notification_type: type } : {};
    return await Notification.findAll({
      where: whereClause,
      include: [
        { model: InventoryItem, as: 'inventoryItem' },
        { model: Batch, as: 'batch' }
      ],
      order: [['created_at', 'DESC']]
    });
  }
};

module.exports = notificationService;

// Test the service
// async function testNotificationService() {
//   try {
//     await notificationService.checkAndCreateNotifications();
//     console.log('Notifications created successfully');

//     const allNotifications = await notificationService.getFilteredNotifications();
//     console.log('All notifications:', allNotifications);

//     const expiringNotifications = await notificationService.getFilteredNotifications('SOON_EXPIRING');
//     console.log('Expiring notifications:', expiringNotifications);
//   } catch (error) {
//     console.error('Error testing notification service:', error);
//   }
// }

// testNotificationService();