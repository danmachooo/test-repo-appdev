const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const InventoryItem = require('./InventoryItem');

const Batch = sequelize.define(
  'Batch',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inventory_item_id: {
      type: DataTypes.INTEGER,
      references: {
        model: InventoryItem,
        key: 'id',
      },
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, // Ensure unique batch numbers
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiry_date: {
      type: DataTypes.DATE,
    },
    supplier: {
      type: DataTypes.STRING(255),
    },
    received_date: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'batches',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['batch_number'], // Ensures each batch number is unique
      },
      {
        unique: false,
        fields: ['expiry_date'], // Optimizes queries that filter or sort by expiry date
      },
      {
        unique: false,
        fields: ['received_date'], // Enhances queries sorted by or filtered on received date
      },
      {
        unique: false,
        fields: ['is_active'], // Enables faster filtering of active or inactive batches
      },
    ],
  }
);

// Define relationships
Batch.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', as: 'inventoryItem' });
InventoryItem.hasMany(Batch, { foreignKey: 'inventory_item_id', as: 'batches' });

module.exports = Batch;
