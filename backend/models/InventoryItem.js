const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category'); // Import Category model

const InventoryItem = sequelize.define(
  'InventoryItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category_id: {
      // Link to the Category model
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category, // The model this column references
        key: 'id', // The column in the referenced model
      },
      onDelete: 'CASCADE', // Delete associated inventory items if category is removed
    },
    quantity_in_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, // Prevent negative stock quantities
      },
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, // Prevent invalid stock level
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      validate: {
        min: 0, // Ensure prices are not negative
      },
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, // Avoid invalid reorder levels
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'inventory_items',
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ['name'], // Speeds up searches for items by name
      },
      {
        unique: false,
        fields: ['category_id'], // Optimizes queries by category_id
      },
      {
        unique: false,
        fields: ['is_active'], // Allows faster filtering of active/inactive items
      },
      {
        unique: false,
        fields: ['quantity_in_stock'], // Enhances queries related to stock levels
      },
      {
        unique: false,
        fields: ['unit_price'], // Optimizes queries for price ranges
      },
    ],
  }
);

// Define the associations
InventoryItem.associate = (models) => {
  // Link InventoryItem to Category
  InventoryItem.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category', // Alias for easier reference in queries
  });

  // Link InventoryItem to Batches
  InventoryItem.hasMany(models.Batch, {
    foreignKey: 'inventory_item_id',
    as: 'batches', // Alias for easier batch reference
  });
};

module.exports = InventoryItem;
