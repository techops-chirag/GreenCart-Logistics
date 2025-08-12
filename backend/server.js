const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const app = require('./src/app');
const DataImporter = require('./src/services/dataImporter');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Import initial data if in development and data doesn't exist
const importInitialData = async () => {
  try {
    const Driver = require('./src/models/Driver');
    const driverCount = await Driver.countDocuments();
    
    if (driverCount === 0) {
      console.log('No existing data found. Importing initial data...');
      await DataImporter.importAllData();
    } else {
      console.log('Data already exists. Skipping import.');
    }
  } catch (error) {
    console.error('Initial data import failed:', error.message);
  }
};

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`GreenCart Logistics API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Import data after server starts
  await importInitialData();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = server;
