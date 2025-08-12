const Order = require('../models/Order');
const Route = require('../models/Route');
const Joi = require('joi');

// Validation schema for order
const orderSchema = Joi.object({
  order_id: Joi.number().integer().min(1).required(),
  value_rs: Joi.number().min(1).required(),
  route_id: Joi.number().integer().min(1).required(),
  delivery_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const orderController = {
  // Get all orders
  getAllOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({})
        .populate('assigned_driver', 'name shift_hours')
        .skip(skip)
        .limit(limit)
        .sort({ order_id: 1 });

      const total = await Order.countDocuments();

      // Add calculated fields to each order
      const ordersWithCalc = orders.map(order => ({
        ...order.toObject(),
        delivery_time_minutes: order.getDeliveryTimeMinutes(),
        qualifies_for_bonus: order.qualifiesForBonus(),
        calculated_profit: order.calculateProfit()
      }));

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: ordersWithCalc,
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
        message: 'Failed to retrieve orders',
        error: error.message
      });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('assigned_driver', 'name shift_hours');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderInfo = {
        ...order.toObject(),
        delivery_time_minutes: order.getDeliveryTimeMinutes(),
        qualifies_for_bonus: order.qualifiesForBonus(),
        calculated_profit: order.calculateProfit()
      };

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: orderInfo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error.message
      });
    }
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      const { error, value } = orderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order data',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Verify route exists
      const route = await Route.findOne({ route_id: value.route_id });
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route not found'
        });
      }

      const order = new Order(value);
      await order.save();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Order with this ID already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  },

  // Update order
  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = orderSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order data',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Verify route exists if route_id is being updated
      if (value.route_id) {
        const route = await Route.findOne({ route_id: value.route_id });
        if (!route) {
          return res.status(400).json({
            success: false,
            message: 'Route not found'
          });
        }
      }

      const order = await Order.findByIdAndUpdate(id, value, {
        new: true,
        runValidators: true
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update order',
        error: error.message
      });
    }
  },

  // Delete order
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByIdAndDelete(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete order',
        error: error.message
      });
    }
  }
};

module.exports = orderController;
