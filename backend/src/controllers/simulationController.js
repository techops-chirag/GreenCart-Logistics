const SimulationService = require('../services/simulationService');
const Joi = require('joi');

// Validation schema for simulation input
const simulationSchema = Joi.object({
  number_of_drivers: Joi.number().integer().min(1).max(50).required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  max_hours_per_day: Joi.number().integer().min(1).max(12).required()
});

const simulationController = {
  // Run new simulation
  runSimulation: async (req, res) => {
    try {
      // Validate input parameters
      const { error, value } = simulationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid simulation parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Run simulation
      const results = await SimulationService.runSimulation(value);

      res.status(200).json({
        success: true,
        message: 'Simulation completed successfully',
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Simulation failed',
        error: error.message
      });
    }
  },

  // Get simulation history
  getSimulationHistory: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const simulations = await SimulationService.getSimulationHistory(limit);

      res.status(200).json({
        success: true,
        message: 'Simulation history retrieved successfully',
        data: simulations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve simulation history',
        error: error.message
      });
    }
  },

  // Get simulation by ID
  getSimulationById: async (req, res) => {
    try {
      const { simulationId } = req.params;
      const simulation = await Simulation.findOne({ simulation_id: simulationId });

      if (!simulation) {
        return res.status(404).json({
          success: false,
          message: 'Simulation not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Simulation retrieved successfully',
        data: simulation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve simulation',
        error: error.message
      });
    }
  }
};

module.exports = simulationController;
