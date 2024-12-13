require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const _ = require('./config/database'); // Import the database setup function
const inventoryRoutes = require('./routes/inventoryRoutes');
const authRoutes = require('./routes/authRoutes');
const settingRoutes = require('./routes/settingsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const app = express();

// Middlewares
app.use(cors());  // Enable Cross-Origin Resource Sharing
app.use(express.json());  // Parse incoming JSON data
app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Routes (You can add your routes here)
app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/chat', chatbotRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
