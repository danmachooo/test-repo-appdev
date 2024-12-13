const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Batch = require('./Batch');
const InventoryItem = require('./InventoryItem');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notification_type: {
    type: DataTypes.ENUM('LOW_STOCK', 'EXPIRED', 'SOON_EXPIRING', 'REORDER'),
    allowNull: false
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Batch,
      key: 'id'
    }
  },
  inventory_item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: InventoryItem,
      key: 'id'
    }
  },
  quantity_left: {
    type: DataTypes.INTEGER
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  seen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

Notification.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
Notification.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', as: 'inventoryItem' });

module.exports = Notification;