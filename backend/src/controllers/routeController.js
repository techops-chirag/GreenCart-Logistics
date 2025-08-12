const Route = require('../models/Route');
const Joi = require('joi');

// Validation schema for route
const routeSchema = Joi.object({
  route_id: Joi.number().integer().min(1).required(),
  distance_km: Joi.number().min(0.1).required(),
  traffic_level: Joi.string().valid('Low', 'Medium', 'High').required(),
  base_time_min: Joi.number().integer().min(1).required()
});

const routeController = {
  // Get all routes
  getAllRoutes: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const routes = await Route.find({})
        .skip(skip)
        .limit(limit)
        .sort({ route_id: 1 });

      const total = await Route.countDocuments();

      // Add calculated fields to each route
      const routesWithCalc = routes.map(route => ({
        ...route.toObject(),
        fuel_cost: route.calculateFuelCost(),
        delivery_time_normal: route.getDeliveryTime(false),
        delivery_time_fatigued: route.getDeliveryTime(true)
      }));

      res.status(200).json({
        success: true,
        message: 'Routes retrieved successfully',
        data: routesWithCalc,
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
        message: 'Failed to retrieve routes',
        error: error.message
      });
    }
  },

  // Get route by ID
  getRouteById: async (req, res) => {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      const routeInfo = {
        ...route.toObject(),
        fuel_cost: route.calculateFuelCost(),
        delivery_time_normal: route.getDeliveryTime(false),
        delivery_time_fatigued: route.getDeliveryTime(true)
      };

      res.status(200).json({
        success: true,
        message: 'Route retrieved successfully',
        data: routeInfo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve route',
        error: error.message
      });
    }
  },

  // Create new route
  createRoute: async (req, res) => {
    try {
      const { error, value } = routeSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid route data',
          errors: error.details.map(detail => detail.message)
        });
      }

      const route = new Route(value);
      await route.save();

      res.status(201).json({
        success: true,
        message: 'Route created successfully',
        data: route
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Route with this ID already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create route',
        error: error.message
      });
    }
  },

  // Update route
  updateRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = routeSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid route data',
          errors: error.details.map(detail => detail.message)
        });
      }

      const route = await Route.findByIdAndUpdate(id, value, {
        new: true,
        runValidators: true
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Route updated successfully',
        data: route
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update route',
        error: error.message
      });
    }
  },

  // Delete route
  deleteRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const route = await Route.findByIdAndDelete(id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Route deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete route',
        error: error.message
      });
    }
  }
};

module.exports = routeController;
