const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  shift_hours: {
    type: Number,
    required: [true, 'Shift hours is required'],
    min: 1,
    max: 12
  },
  past_week_hours: {
    type: [Number],
    required: [true, 'Past week hours is required'],
    validate: {
      validator: function(arr) {
        return arr.length === 7;
      },
      message: 'Past week hours must contain exactly 7 days'
    }
  },
  is_fatigued: {
    type: Boolean,
    default: false
  },
  current_workload: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate if driver is fatigued (worked >8 hours yesterday)
driverSchema.methods.checkFatigue = function() {
  const yesterdayHours = this.past_week_hours[this.past_week_hours.length - 1];
  this.is_fatigued = yesterdayHours > 8;
  return this.is_fatigued;
};

// Calculate average weekly hours
driverSchema.methods.getWeeklyAverage = function() {
  const total = this.past_week_hours.reduce((sum, hours) => sum + hours, 0);
  return total / 7;
};

module.exports = mongoose.model('Driver', driverSchema);
