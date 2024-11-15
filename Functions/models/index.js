// syncDatabase.js (or similar filename)
const sequelize = require('../config/db');
const Agent = require('./agentModel');
const PreOrder = require('./preOrderModel');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // WARNING: This will drop and recreate the tables
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = syncDatabase;
