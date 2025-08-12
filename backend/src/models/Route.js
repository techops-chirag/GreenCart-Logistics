const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_id: {
    type: Number,
    required: [true, 'Route ID is required'],
    unique: true
  },
  distance_km: {
    type: Number,
    required: [true, 'Distance is required'],
    min: 0.1
  },
  traffic_level: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: ['Low', 'Medium', 'High']
  },
  base_time_min: {
    type: Number,
    required: [true, 'Base time is required'],
    min: 1
  }
}, {
  timestamps: true
});

// Calculate fuel cost based on distance and traffic
routeSchema.methods.calculateFuelCost = function() {
  const baseCost = this.distance_km * 5; // ₹5/km base cost
  const trafficSurcharge = this.traffic_level === 'High' ? this.distance_km * 2 : 0;
  return baseCost + trafficSurcharge;
};

// Calculate delivery time considering traffic
routeSchema.methods.getDeliveryTime = function(driverFatigued = false) {
  let deliveryTime = this.base_time_min;
  
  // If driver is fatigued, increase delivery time by 30%
  if (driverFatigued) {
    deliveryTime = Math.ceil(deliveryTime * 1.3);
  }
  
  return deliveryTime;
};

module.exports = mongoose.model('Route', routeSchema);
