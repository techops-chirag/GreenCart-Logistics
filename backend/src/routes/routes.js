const express = require('express');
const routeController = require('../controllers/routeController');
const { authenticateToken, requireManagerRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and manager role
router.use(authenticateToken, requireManagerRole);

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
