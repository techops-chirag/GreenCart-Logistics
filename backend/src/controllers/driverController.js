const Driver = require('../models/Driver');
const Joi = require('joi');

// Validation schema for driver
const driverSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  shift_hours: Joi.number().integer().min(1).max(12).required(),
  past_week_hours: Joi.array().items(Joi.number().min(0).max(24)).length(7).required()
});

const driverController = {
  // Get all drivers
  getAllDrivers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const drivers = await Driver.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Driver.countDocuments();

      res.status(200).json({
        success: true,
        message: 'Drivers retrieved successfully',
        data: drivers,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve drivers',
        error: error.message
      });
    }
  },

  // Get driver by ID
  getDriverById: async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await Driver.findById(id);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Calculate additional driver info
      const driverInfo = {
        ...driver.toObject(),
        weekly_average: driver.getWeeklyAverage(),
        is_fatigued: driver.checkFatigue()
      };

      res.status(200).json({
        success: true,
        message: 'Driver retrieved successfully',
        data: driverInfo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve driver',
        error: error.message
      });
    }
  },

  // Create new driver
  createDriver: async (req, res) => {
    try {
      const { error, value } = driverSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver data',
          errors: error.details.map(detail => detail.message)
        });
      }

      const driver = new Driver(value);
      await driver.save();

      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: driver
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Driver with this name already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create driver',
        error: error.message
      });
    }
  },

  // Update driver
  updateDriver: async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = driverSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver data',
          errors: error.details.map(detail => detail.message)
        });
      }

      const driver = await Driver.findByIdAndUpdate(id, value, {
        new: true,
        runValidators: true
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Driver updated successfully',
        data: driver
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update driver',
        error: error.message
      });
    }
  },

  // Delete driver
  deleteDriver: async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await Driver.findByIdAndDelete(id);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Driver deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete driver',
        error: error.message
      });
    }
  }
};

module.exports = driverController;
