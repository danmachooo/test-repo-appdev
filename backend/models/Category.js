const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'categories',
  timestamps: false,
});

Category.associate = (models) => {
  // Link Category to InventoryItem
  Category.hasMany(models.InventoryItem, {
    foreignKey: 'category_id',
    as: 'items', // Alias for easier reference in queries
  });
};

module.exports = Category;
