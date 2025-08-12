const SimulationService = require('../services/simulationService');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');

describe('SimulationService', () => {
  beforeEach(async () => {
    // Create test data
    await Driver.create([
      {
        name: 'Test Driver 1',
        shift_hours: 8,
        past_week_hours: [8, 7, 8, 8, 6, 9, 7]
      },
      {
        name: 'Test Driver 2',
        shift_hours: 6,
        past_week_hours: [6, 6, 7, 6, 5, 8, 10] // Last day >8 hours (fatigued)
      }
    ]);

    await Route.create([
      {
        route_id: 1,
        distance_km: 10,
        traffic_level: 'Low',
        base_time_min: 30
      },
      {
        route_id: 2,
        distance_km: 15,
        traffic_level: 'High',
        base_time_min: 60
      }
    ]);

    await Order.create([
      {
        order_id: 1,
        value_rs: 1500, // High value order
        route_id: 1,
        delivery_time: '09:30'
      },
      {
        order_id: 2,
        value_rs: 500, // Low value order
        route_id: 2,
        delivery_time: '10:00'
      }
    ]);
  });

  test('should run simulation with valid parameters', async () => {
    const inputParams = {
      number_of_drivers: 2,
      start_time: '09:00',
      max_hours_per_day: 8
    };

    const result = await SimulationService.runSimulation(inputParams);

    expect(result).toHaveProperty('simulation_id');
    expect(result).toHaveProperty('total_profit');
    expect(result).toHaveProperty('efficiency_score');
    expect(result).toHaveProperty('total_deliveries');
    expect(result.total_deliveries).toBeGreaterThan(0);
    expect(result.efficiency_score).toBeGreaterThanOrEqual(0);
    expect(result.efficiency_score).toBeLessThanOrEqual(100);
  });

  test('should apply late delivery penalty correctly', async () => {
    // Create an order that will definitely be late
    await Order.create({
      order_id: 3,
      value_rs: 1000,
      route_id: 1,
      delivery_time: '09:01' // Very early delivery time, will be late
    });

    const inputParams = {
      number_of_drivers: 1,
      start_time: '09:00',
      max_hours_per_day: 8
    };

    const result = await SimulationService.runSimulation(inputParams);
    expect(result.total_penalties).toBeGreaterThanOrEqual(50); // At least one ₹50 penalty
  });

  test('should apply high-value bonus for orders > ₹1000', async () => {
    const inputParams = {
      number_of_drivers: 2,
      start_time: '09:00',
      max_hours_per_day: 8
    };

    const result = await SimulationService.runSimulation(inputParams);
    
    // Should have bonuses for high-value orders delivered on time
    expect(result.total_bonuses).toBeGreaterThan(0);
  });

  test('should calculate fuel costs correctly', async () => {
    const inputParams = {
      number_of_drivers: 2,
      start_time: '09:00',
      max_hours_per_day: 8
    };

    const result = await SimulationService.runSimulation(inputParams);

    // Fuel cost should be calculated based on distance and traffic
    expect(result.total_fuel_cost).toBeGreaterThan(0);
    
    // High traffic route should cost more than low traffic
    // Route 1: 10km * ₹5 = ₹50 (Low traffic)
    // Route 2: 15km * ₹5 + 15km * ₹2 = ₹105 (High traffic)
  });

  test('should handle driver fatigue correctly', async () => {
    const inputParams = {
      number_of_drivers: 2,
      start_time: '09:00',
      max_hours_per_day: 8
    };

    const result = await SimulationService.runSimulation(inputParams);

    // Check that fatigued driver is identified
    const fatiguedDriver = result.driver_assignments.find(d => d.is_fatigued);
    expect(fatiguedDriver).toBeDefined();
    expect(fatiguedDriver.driver_name).toBe('Test Driver 2');
  });

  test('should throw error with insufficient drivers', async () => {
    const inputParams = {
      number_of_drivers: 10, // More than available
      start_time: '09:00',
      max_hours_per_day: 8
    };

    await expect(SimulationService.runSimulation(inputParams))
      .rejects
      .toThrow('Only 2 drivers available, but 10 requested');
  });
});
