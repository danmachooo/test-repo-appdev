const inventoryService = require('../services/inventoryService');
const notificationEmitter = require('../events/notificationEmitter');
const Notification = require('../models/Notification');


const inventoryController = {
  // Add a new inventory item
  async addInventoryItem(req, res) {
    try {
      const newItem = await inventoryService.addInventoryItem(req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get all inventory items
  async getAllInventoryItems(req, res) {
    try {
      const items = await inventoryService.getAllInventoryItems();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error in getAllInventoryItems controller:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An error occurred while fetching inventory items',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  async getAllDistinctItems(req, res) {
    try {
      const items = await inventoryService.getAllDistinctItems();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error in getAllDictinctItems controller:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An error occurred while fetching getAllDictinctItems controlller',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get inventory item by ID
  async getInventoryItemById(req, res) {
    try {
      const item = await inventoryService.getInventoryItemById(req.params.id);
      if (item) {
        res.json({ success: true, data: item });
      } else {
        res.status(404).json({ success: false, error: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update inventory item
  async updateInventoryItem(req, res) {
    try {
      const updatedItem = await inventoryService.updateInventoryItem(req.params.id, req.body);
      if (updatedItem) {
        res.json({ success: true, data: updatedItem });
      } else {
        res.status(404).json({ success: false, error: 'Item not found' });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Soft delete inventory item
  async softDeleteInventoryItem(req, res) {
    try {
      const deletedItem = await inventoryService.softDeleteInventoryItem(req.params.id);
      if (deletedItem) {
        res.json({ success: true, message: 'Item soft deleted successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Add a new batch
  async addBatch(req, res) {
    try {
      const newBatch = await inventoryService.addBatch(req.body);
      notificationEmitter.emit('batchAddedOrUpdated', { action: 'add', batch: newBatch });
      console.log('Emitting batchAddedOrUpdated event for batch:', newBatch || updatedBatch);

      res.status(201).json({ success: true, data: newBatch });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
  // Update an existing batch
async updateBatch(req, res) {
  try {
    const updatedBatch = await inventoryService.updateBatch(req.params.id, req.body);
    notificationEmitter.emit('batchAddedOrUpdated', { action: 'update', batch: updatedBatch });
    if (updatedBatch) {
      res.json({ success: true, data: updatedBatch });
    } else {
      res.status(404).json({ success: false, error: 'Batch not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
},
async disposeBatch(req, res) {
  try {
    const { id } = req.params;
    const disposedBatch = await inventoryService.disposeBatch(id);

    await Notification.update({seen: true}, {where: {batch_id: id}})
    if (disposedBatch) {
      res.json({ success: true, data: disposedBatch, message: 'Batch disposed successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Batch not found' });
    }
  } catch (error) {
    console.error('Error disposing batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
},



  // Get low stock items
  async getLowStockItems(req, res) {
    try {
      const lowStockItems = await inventoryService.getLowStockItems();
      res.json({ success: true, data: lowStockItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get expiring batches
  async getExpiringBatches(req, res) {
    try {
      const daysThreshold = parseInt(req.query.days) || 30; // Default to 30 days if not specified
      const expiringBatches = await inventoryService.getExpiringBatches(daysThreshold);
      res.json({ success: true, data: expiringBatches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Record a transaction
  async recordTransaction(req, res) {
    try {
      const transaction = await inventoryService.recordTransaction(req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Create a notification
  async createNotification(req, res) {
    try {
      const notification = await inventoryService.createNotification(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Add a new category
  async addCategory(req, res) {
    try {
      const newCategory = await inventoryService.addCategory(req.body);
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await inventoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  async getAllTransactions(req, res) {
    try {
      const transactions = await inventoryService.getAllTransactions();
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const category = await inventoryService.getCategoryById(req.params.id);
      if (category) {
        res.json({ success: true, data: category });
      } else {
        res.status(404).json({ success: false, error: 'Category not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update a category
  async updateCategory(req, res) {
    try {
      const updatedCategory = await inventoryService.updateCategory(req.params.id, req.body);
      if (updatedCategory) {
        res.json({ success: true, data: updatedCategory });
      } else {
        res.status(404).json({ success: false, error: 'Category not found' });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
  async getNotifications(req, res) {
    try {
      const notifications = await inventoryService.getNotifications();
      notificationEmitter.emit('DOMloaded');
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async markAsSeen(req, res) {
    try {
      const updatedNotification = await inventoryService.markNotificationAsSeen(req.params.id);
      if (updatedNotification) {
        res.json({ success: true, data: updatedNotification });
      } else {
        res.status(404).json({ success: false, error: 'Notification not found' });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
  async markAllAsSeen(req, res) {
    try {
      const { type } = req.body;
      const updatedCount = await inventoryService.markAllNotificationsAsSeen(type);
      res.json({ 
        success: true, 
        message: `${updatedCount} notification(s) marked as seen`,
        updatedCount 
      });
    } catch (error) {
      console.error('Error in markAllAsSeen controller:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An error occurred while marking notifications as seen',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  

  // Soft delete category
  async softDeleteCategory(req, res) {
    try {
      const deletedCategory = await inventoryService.softDeleteCategory(req.params.id);
      if (deletedCategory) {
        res.json({ success: true, message: 'Category soft deleted successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Category not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getReport(req, res) {
    try {
      const { type, year, month } = req.query;
      let reportData;

      if (type === 'monthly') {
        if (!year || !month) {
          return res.status(400).json({ success: false, message: 'Year and month are required for monthly reports.' });
        }
        reportData = await inventoryService.getMonthlyReport(parseInt(year), parseInt(month));
      } else if (type === 'yearly') {
        if (!year) {
          return res.status(400).json({ success: false, message: 'Year is required for yearly reports.' });
        }
        reportData = await inventoryService.getYearlyReport(parseInt(year));
      } else {
        return res.status(400).json({ success: false, message: 'Invalid report type.' });
      }

      const lowStockItems = await inventoryService.getLowStockItems();
      const expiringBatches = await inventoryService.getExpiringBatches(30); // 30 days threshold

      res.json({
        success: true,
        data: reportData,
        lowStockItems,
        expiringBatches,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report.' });
    }
  },

  async uploadExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const results = await inventoryService.processExcelFile(req.file.path);

      res.json({
        success: true,
        message: 'File processed',
        data: results
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ success: false, message: 'Error processing file', error: error.message });
    }
  },
  async reduceStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, patientName } = req.body;

      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
      }

      const updatedItem = await inventoryService.reduceStock(id, quantity, patientName);
      if (updatedItem) {
        notificationEmitter.emit('batchAddedOrUpdated', { action: 'update'});
        res.json({ success: true, data: updatedItem });
      } else {
        res.status(404).json({ success: false, message: 'Item not found.' });
      }
    } catch (error) {
      console.error('Error reducing stock:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async getItemHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await inventoryService.getItemHistory(id);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error fetching item history:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
  

};

module.exports = inventoryController;
