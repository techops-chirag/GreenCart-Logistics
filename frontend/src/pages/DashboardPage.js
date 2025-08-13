import React, { useState, useEffect } from 'react';
import { simulationAPI } from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import DeliveryChart from '../components/charts/DeliveryChart';
import FuelCostChart from '../components/charts/FuelCostChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  DollarSign, 
  TrendingUp, 
  Truck, 
  Fuel, 
  Clock,
  AlertCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [latestSimulation, setLatestSimulation] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await simulationAPI.getHistory(10);
      
      if (response.data.data && response.data.data.length > 0) {
        setLatestSimulation(response.data.data[0]);
        setSimulationHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const calculateTrends = () => {
    if (simulationHistory.length < 2) return {};
    
    const current = simulationHistory[0].results;
    const previous = simulationHistory[1].results;
    
    return {
      profitTrend: ((current.total_profit - previous.total_profit) / previous.total_profit * 100).toFixed(1),
      efficiencyTrend: (current.efficiency_score - previous.efficiency_score).toFixed(1),
      deliveryTrend: ((current.total_deliveries - previous.total_deliveries) / previous.total_deliveries * 100).toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!latestSimulation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Simulation Data</h2>
        <p className="text-gray-600 mb-6">
          Run your first simulation to see dashboard insights and analytics.
        </p>
        <a
          href="/simulation"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Run First Simulation
        </a>
      </div>
    );
  }

  const trends = calculateTrends();
  const { results } = latestSimulation;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Latest simulation results and performance metrics
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Last Simulation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Latest Simulation</span>
        </div>
        <p className="text-blue-800 mt-1">
          ID: {latestSimulation.simulation_id} • 
          Executed: {new Date(latestSimulation.createdAt).toLocaleString()} • 
          Runtime: {latestSimulation.execution_time_ms}ms
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        <KPICard
          title="Total Profit"
          value={results.total_profit}
          unit="₹"
          trend={trends.profitTrend > 0 ? 'up' : trends.profitTrend < 0 ? 'down' : 'neutral'}
          trendValue={trends.profitTrend}
          icon={DollarSign}
          color="green"
        />
        
        <KPICard
          title="Efficiency Score"
          value={results.efficiency_score}
          unit="%"
          trend={trends.efficiencyTrend > 0 ? 'up' : trends.efficiencyTrend < 0 ? 'down' : 'neutral'}
          trendValue={trends.efficiencyTrend}
          icon={TrendingUp}
          color="blue"
        />
        
        <KPICard
          title="Total Deliveries"
          value={results.total_deliveries}
          trend={trends.deliveryTrend > 0 ? 'up' : trends.deliveryTrend < 0 ? 'down' : 'neutral'}
          trendValue={trends.deliveryTrend}
          icon={Truck}
          color="purple"
        />
        
        <KPICard
          title="Fuel Cost"
          value={results.total_fuel_cost}
          unit="₹"
          icon={Fuel}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        <DeliveryChart simulationData={results} />
        <FuelCostChart simulationData={results} simulationHistory={simulationHistory} />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">On-time Deliveries:</span>
              <span className="font-medium text-green-600">{results.on_time_deliveries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Deliveries:</span>
              <span className="font-medium text-red-600">{results.late_deliveries}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Efficiency Rate:</span>
              <span className="font-bold text-blue-600">{results.efficiency_score}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bonuses:</span>
              <span className="font-medium text-green-600">₹{results.total_bonuses?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Penalties:</span>
              <span className="font-medium text-red-600">₹{results.total_penalties?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Net Profit:</span>
              <span className="font-bold text-blue-600">₹{results.total_profit?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Utilization</h3>
          <div className="space-y-3">
            {results.driver_assignments?.slice(0, 3).map((driver, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{driver.driver_name}</span>
                  {driver.is_fatigued && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Fatigued
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {driver.orders_assigned?.length || 0} orders
                </span>
              </div>
            ))}
            {results.driver_assignments?.length > 3 && (
              <p className="text-sm text-gray-500 text-center pt-2 border-t">
                +{results.driver_assignments.length - 3} more drivers
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
