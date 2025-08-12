const express = require('express');
const simulationController = require('../controllers/simulationController');
const { authenticateToken, requireManagerRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and manager role
router.use(authenticateToken, requireManagerRole);

router.post('/run', simulationController.runSimulation);
router.get('/history', simulationController.getSimulationHistory);
router.get('/:simulationId', simulationController.getSimulationById);

module.exports = router;
