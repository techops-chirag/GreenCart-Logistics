const express = require('express');
const driverController = require('../controllers/driverController');
const { authenticateToken, requireManagerRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and manager role
router.use(authenticateToken, requireManagerRole);

router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
