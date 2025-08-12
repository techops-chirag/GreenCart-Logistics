const Route = require('../models/Route');
const Order = require('../models/Order');

describe('KPI Calculations', () => {
  test('Route should calculate fuel cost correctly', () => {
    // Low traffic route
    const lowTrafficRoute = new Route({
      route_id: 1,
      distance_km: 10,
      traffic_level: 'Low',
      base_time_min: 30
    });

    expect(lowTrafficRoute.calculateFuelCost()).toBe(50); // 10km * ₹5

    // High traffic route
    const highTrafficRoute = new Route({
      route_id: 2,
      distance_km: 10,
      traffic_level: 'High',
      base_time_min: 30
    });

    expect(highTrafficRoute.calculateFuelCost()).toBe(70); // 10km * ₹5 + 10km * ₹2
  });

  test('Order should identify high-value orders correctly', () => {
    const highValueOrder = new Order({
      order_id: 1,
      value_rs: 1500,
      route_id: 1,
      delivery_time: '09:30'
    });

    const lowValueOrder = new Order({
      order_id: 2,
      value_rs: 500,
      route_id: 1,
      delivery_time: '09:30'
    });

    expect(highValueOrder.qualifiesForBonus()).toBe(true);
    expect(lowValueOrder.qualifiesForBonus()).toBe(false);
  });

  test('Order should convert delivery time to minutes correctly', () => {
    const order = new Order({
      order_id: 1,
      value_rs: 1000,
      route_id: 1,
      delivery_time: '14:30'
    });

    expect(order.getDeliveryTimeMinutes()).toBe(870); // 14*60 + 30
  });

  test('Order should calculate profit correctly', () => {
    const order = new Order({
      order_id: 1,
      value_rs: 1000,
      route_id: 1,
      delivery_time: '09:30',
      bonus_applied: 100,
      penalty_applied: 50
    });

    expect(order.calculateProfit()).toBe(1050); // 1000 + 100 - 50
  });
});
