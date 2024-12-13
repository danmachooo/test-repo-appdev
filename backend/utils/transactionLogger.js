// utils/transactionLogger.js
const Transaction = require('../models/Transaction');

async function logTransaction(inventoryItemId, batchId, transactionType, quantityChange, remarks) {
  try {
    await Transaction.create({
      inventory_item_id: inventoryItemId,
      batch_id: batchId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      remarks: remarks
    });
  } catch (error) {
    console.error('Error logging transaction:', error);
    // Optionally, you might want to throw this error to be handled by the caller
  }
}

module.exports = logTransaction;