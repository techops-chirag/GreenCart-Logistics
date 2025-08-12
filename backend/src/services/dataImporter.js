const fs = require('fs');
const csv = require('csv-parser');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

class DataImporter {
  static async importDrivers(filePath = './data/drivers.csv') {
    try {
      const drivers = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const pastWeekHours = row.past_week_hours.split('|').map(Number);
            drivers.push({
              name: row.name,
              shift_hours: parseInt(row.shift_hours),
              past_week_hours: pastWeekHours
            });
          })
          .on('end', async () => {
            try {
              // Clear existing drivers
              await Driver.deleteMany({});
              
              // Insert new drivers
              const result = await Driver.insertMany(drivers);
              console.log(`Imported ${result.length} drivers`);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to import drivers: ${error.message}`);
    }
  }

  static async importRoutes(filePath = './data/routes.csv') {
    try {
      const routes = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            routes.push({
              route_id: parseInt(row.route_id),
              distance_km: parseFloat(row.distance_km),
              traffic_level: row.traffic_level,
              base_time_min: parseInt(row.base_time_min)
            });
          })
          .on('end', async () => {
            try {
              // Clear existing routes
              await Route.deleteMany({});
              
              // Insert new routes
              const result = await Route.insertMany(routes);
              console.log(`Imported ${result.length} routes`);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to import routes: ${error.message}`);
    }
  }

  static async importOrders(filePath = './data/orders.csv') {
    try {
      const orders = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            orders.push({
              order_id: parseInt(row.order_id),
              value_rs: parseInt(row.value_rs),
              route_id: parseInt(row.route_id),
              delivery_time: row.delivery_time
            });
          })
          .on('end', async () => {
            try {
              // Clear existing orders
              await Order.deleteMany({});
              
              // Insert new orders
              const result = await Order.insertMany(orders);
              console.log(`Imported ${result.length} orders`);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to import orders: ${error.message}`);
    }
  }

  static async importAllData() {
    try {
      console.log('Starting data import...');
      
      await this.importDrivers();
      await this.importRoutes();
      await this.importOrders();
      
      console.log('All data imported successfully!');
      return true;
    } catch (error) {
      console.error('Data import failed:', error.message);
      throw error;
    }
  }
}

module.exports = DataImporter;
