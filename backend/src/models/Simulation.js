const mongoose = require('mongoose');

const simulationResultSchema = new mongoose.Schema({
  simulation_id: {
    type: String,
    required: true,
    unique: true
  },
  input_parameters: {
    number_of_drivers: {
      type: Number,
      required: true,
      min: 1
    },
    start_time: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    max_hours_per_day: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    }
  },
  results: {
    total_profit: {
      type: Number,
      required: true
    },
    efficiency_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    total_deliveries: {
      type: Number,
      required: true
    },
    on_time_deliveries: {
      type: Number,
      required: true
    },
    late_deliveries: {
      type: Number,
      required: true
    },
    total_penalties: {
      type: Number,
      default: 0
    },
    total_bonuses: {
      type: Number,
      default: 0
    },
    total_fuel_cost: {
      type: Number,
      required: true
    },
    driver_assignments: [{
      driver_name: String,
      orders_assigned: [Number],
      total_hours_worked: Number,
      is_fatigued: Boolean
    }]
  },
  execution_time_ms: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', simulationResultSchema);
