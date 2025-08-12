const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: [true, 'Order ID is required'],
    unique: true
  },
  value_rs: {
    type: Number,
    required: [true, 'Order value is required'],
    min: 1
  },
  route_id: {
    type: Number,
    required: [true, 'Route ID is required'],
    ref: 'Route'
  },
  delivery_time: {
    type: String,
    required: [true, 'Delivery time is required'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  assigned_driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered', 'late'],
    default: 'pending'
  },
  actual_delivery_time: {
    type: Number, // in minutes
    default: null
  },
  penalty_applied: {
    type: Number,
    default: 0
  },
  bonus_applied: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Convert delivery time string (HH:MM) to minutes
orderSchema.methods.getDeliveryTimeMinutes = function() {
  const [hours, minutes] = this.delivery_time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if order qualifies for high-value bonus
orderSchema.methods.qualifiesForBonus = function() {
  return this.value_rs > 1000;
};

// Calculate order profit (value + bonus - penalty)
orderSchema.methods.calculateProfit = function() {
  return this.value_rs + this.bonus_applied - this.penalty_applied;
};

module.exports = mongoose.model('Order', orderSchema);
