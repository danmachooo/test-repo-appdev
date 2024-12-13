const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Inventory Item routes
router.post('/items', inventoryController.addInventoryItem);
router.get('/items', inventoryController.getAllInventoryItems);
router.get('/items/:id', inventoryController.getInventoryItemById);
router.put('/items/:id', inventoryController.updateInventoryItem);
router.delete('/items/:id', inventoryController.softDeleteInventoryItem);
router.post('/items/:id/reduce-stock', inventoryController.reduceStock);
router.get('/items/:id/history', inventoryController.getItemHistory);
// Batch routes
router.post('/batches', inventoryController.addBatch);
router.put('/batches/:id', inventoryController.updateBatch);
router.post('/batches/:id/dispose', inventoryController.disposeBatch);

// Low stock and expiring items routes
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/expiring-batches', inventoryController.getExpiringBatches);

// Transaction routes
router.post('/transactions', inventoryController.recordTransaction);
router.get('/transactions', inventoryController.getAllTransactions);

// Notification routes
router.post('/notifications', inventoryController.createNotification);
router.get('/notifications', inventoryController.getNotifications);
router.patch('/notifications/:id', inventoryController.markAsSeen);
router.post('/notifications/mark-all-seen', inventoryController.markAllAsSeen);

// Category routes
router.post('/categories', inventoryController.addCategory);
router.get('/categories', inventoryController.getAllCategories);
router.get('/categories/:id', inventoryController.getCategoryById);
router.put('/categories/:id', inventoryController.updateCategory);
router.delete('/categories/:id', inventoryController.softDeleteCategory);


//Reports
router.get('/report', inventoryController.getReport);

//excel upload
router.post('/upload-excel', upload.single('file'), inventoryController.uploadExcel);


module.exports = router;

