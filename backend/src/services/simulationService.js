const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const Simulation = require('../models/Simulation');

class SimulationService {
  static async runSimulation(inputParams) {
    const startTime = Date.now();
    const { number_of_drivers, start_time, max_hours_per_day } = inputParams;
    
    try {
      // 1. Get available drivers (limit by number_of_drivers)
      const availableDrivers = await Driver.find({})
        .limit(number_of_drivers)
        .exec();
      
      if (availableDrivers.length < number_of_drivers) {
        throw new Error(`Only ${availableDrivers.length} drivers available, but ${number_of_drivers} requested`);
      }

      // 2. Get all orders and routes
      const orders = await Order.find({}).exec();
      const routes = await Route.find({}).exec();
      
      // Create route lookup map
      const routeMap = routes.reduce((map, route) => {
        map[route.route_id] = route;
        return map;
      }, {});

      // 3. Check driver fatigue status
      availableDrivers.forEach(driver => {
        driver.checkFatigue();
      });

      // 4. Sort orders by delivery time (earliest first)
      const sortedOrders = orders.sort((a, b) => {
        return a.getDeliveryTimeMinutes() - b.getDeliveryTimeMinutes();
      });

      // 5. Initialize simulation state
      const simulationState = {
        drivers: availableDrivers.map(driver => ({
          driver: driver,
          current_hours: 0,
          assigned_orders: [],
          current_time: this.parseTimeToMinutes(start_time),
          is_fatigued: driver.is_fatigued
        })),
        results: {
          total_deliveries: 0,
          on_time_deliveries: 0,
          late_deliveries: 0,
          total_penalties: 0,
          total_bonuses: 0,
          total_fuel_cost: 0,
          total_profit: 0
        }
      };

      // 6. Assign orders to drivers using round-robin with capacity check
      for (const order of sortedOrders) {
        const route = routeMap[order.route_id];
        if (!route) continue;

        // Find available driver with least workload
        const availableDriver = this.findBestDriver(
          simulationState.drivers, 
          route, 
          max_hours_per_day
        );

        if (availableDriver) {
          await this.assignOrderToDriver(
            availableDriver, 
            order, 
            route, 
            simulationState.results
          );
        }
      }

      // 7. Calculate final results
      const finalResults = this.calculateFinalResults(simulationState);

      // 8. Save simulation to database
      const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const simulation = new Simulation({
        simulation_id: simulationId,
        input_parameters: inputParams,
        results: finalResults,
        execution_time_ms: Date.now() - startTime
      });

      await simulation.save();

      return {
        simulation_id: simulationId,
        ...finalResults,
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      throw new Error(`Simulation failed: ${error.message}`);
    }
  }

  static findBestDriver(driverStates, route, maxHours) {
    // Filter drivers who can handle this delivery
    const availableDrivers = driverStates.filter(driverState => {
      const deliveryTime = route.getDeliveryTime(driverState.is_fatigued);
      const additionalHours = Math.ceil(deliveryTime / 60);
      
      return (driverState.current_hours + additionalHours) <= maxHours;
    });

    if (availableDrivers.length === 0) return null;

    // Return driver with least current workload
    return availableDrivers.reduce((best, current) => {
      return current.current_hours < best.current_hours ? current : best;
    });
  }

  static async assignOrderToDriver(driverState, order, route, results) {
    // Calculate delivery time considering driver fatigue
    const baseDeliveryTime = route.getDeliveryTime(driverState.is_fatigued);
    const deliveryHours = Math.ceil(baseDeliveryTime / 60);

    // Update driver state
    driverState.current_hours += deliveryHours;
    driverState.assigned_orders.push(order.order_id);
    driverState.current_time += baseDeliveryTime;

    // Calculate fuel cost
    const fuelCost = route.calculateFuelCost();
    results.total_fuel_cost += fuelCost;

    // Check if delivery is late
    const orderDeliveryTime = order.getDeliveryTimeMinutes();
    const allowedTime = route.base_time_min + 10; // +10 minutes grace period
    const isLate = baseDeliveryTime > allowedTime;

    // Apply penalties and bonuses
    let penalty = 0;
    let bonus = 0;

    if (isLate) {
      penalty = 50; // ₹50 late delivery penalty
      results.total_penalties += penalty;
      results.late_deliveries++;
      order.status = 'late';
    } else {
      results.on_time_deliveries++;
      
      // High-value bonus: 10% for orders >₹1000 delivered on time
      if (order.qualifiesForBonus()) {
        bonus = Math.round(order.value_rs * 0.1);
        results.total_bonuses += bonus;
      }
      order.status = 'delivered';
    }

    // Update order with results
    order.assigned_driver = driverState.driver._id;
    order.actual_delivery_time = baseDeliveryTime;
    order.penalty_applied = penalty;
    order.bonus_applied = bonus;

    // Calculate order profit
    const orderProfit = order.value_rs + bonus - penalty - fuelCost;
    results.total_profit += orderProfit;
    results.total_deliveries++;

    await order.save();
  }

  static calculateFinalResults(simulationState) {
    const { results, drivers } = simulationState;

    // Calculate efficiency score
    const efficiencyScore = results.total_deliveries > 0 
      ? Math.round((results.on_time_deliveries / results.total_deliveries) * 100)
      : 0;

    return {
      total_profit: Math.round(results.total_profit),
      efficiency_score: efficiencyScore,
      total_deliveries: results.total_deliveries,
      on_time_deliveries: results.on_time_deliveries,
      late_deliveries: results.late_deliveries,
      total_penalties: results.total_penalties,
      total_bonuses: results.total_bonuses,
      total_fuel_cost: Math.round(results.total_fuel_cost),
      driver_assignments: drivers.map(driverState => ({
        driver_name: driverState.driver.name,
        orders_assigned: driverState.assigned_orders,
        total_hours_worked: driverState.current_hours,
        is_fatigued: driverState.is_fatigued
      }))
    };
  }

  static parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static async getSimulationHistory(limit = 10) {
    try {
      const simulations = await Simulation.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      
      return simulations;
    } catch (error) {
      throw new Error(`Failed to fetch simulation history: ${error.message}`);
    }
  }
}

module.exports = SimulationService;
