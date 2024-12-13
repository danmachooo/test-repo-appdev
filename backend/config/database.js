const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('university_clinic_inventoryv2', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // set to console.log to see the raw SQL queries
});

// Create an async function to authenticate the connection
const authenticateDatabase = async () => {
  try {
    // Attempt to authenticate the connection to the database
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const syncDatabase = async () => {
  try {
      await sequelize.sync({ force: false  }); // Use { force: true } to drop and recreate the table
      console.log('Database synced.');
  } catch (error) {
      console.error('Error syncing database:', error);
  }
}; 


// Call the authenticateDatabase function
authenticateDatabase();
syncDatabase();

module.exports = sequelize;


