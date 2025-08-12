import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { simulationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DeliveryChart from '../components/charts/DeliveryChart';
import FuelCostChart from '../components/charts/FuelCostChart';
import { 
  Play, 
  Settings, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const SimulationPage = () => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      number_of_drivers: 5,
      start_time: '09:00',
      max_hours_per_day: 8
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await simulationAPI.run(data);
      
      setSimulationResults(response.data.data);
      toast.success('Simulation completed successfully!');
      
      // Load updated history
      loadSimulationHistory();
    } catch (error) {
      console.error('Simulation failed:', error);
      toast.error(error.response?.data?.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSimulationHistory = async () => {
    try {
      const response = await simulationAPI.getHistory(5);
      setSimulationHistory(response.data.data);
    } catch (error) {
      console.error('Failed to load simulation history:', error);
    }
  };

  const handleReset = () => {
    reset();
    setSimulationResults(null);
  };

  React.useEffect(() => {
    loadSimulationHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Delivery Simulation</h1>
        <p className="text-gray-600 mt-1">
          Configure parameters and run simulations to optimize delivery operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Simulation Parameters</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Number of Drivers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Drivers
                </label>
                <input
                  type="number"
                  {...register('number_of_drivers', {
                    required: 'Number of drivers is required',
                    min: { value: 1, message: 'Minimum 1 driver required' },
                    max: { value: 50, message: 'Maximum 50 drivers allowed' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of drivers"
                />
                {errors.number_of_drivers && (
                  <p className="text-red-500 text-sm mt-1">{errors.number_of_drivers.message}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  {...register('start_time', {
                    required: 'Start time is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
                )}
              </div>

              {/* Max Hours per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Hours per Driver per Day
                </label>
                <input
                  type="number"
                  {...register('max_hours_per_day', {
                    required: 'Max hours is required',
                    min: { value: 1, message: 'Minimum 1 hour required' },
                    max: { value: 12, message: 'Maximum 12 hours allowed' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter max hours"
                />
                {errors.max_hours_per_day && (
                  <p className="text-red-500 text-sm mt-1">{errors.max_hours_per_day.message}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Running...' : 'Run Simulation'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Simulation Rules Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Simulation Rules</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Late delivery penalty: ₹50 if &gt; (base time + 10 min)</li>
                <li>• Driver fatigue: 30% slower if worked &gt; 8hrs yesterday</li>
                <li>• High-value bonus: 10% for orders &gt; ₹1000 delivered on-time</li>
                <li>• Fuel cost: ₹5/km base + ₹2/km for high traffic</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-12">
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="text-gray-600 mt-4">Running simulation...</p>
              </div>
            </div>
          )}

          {!loading && !simulationResults && (
            <div className="bg-white rounded-lg shadow-md p-12">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Simulate</h2>
                <p className="text-gray-600">
                  Configure your parameters and click "Run Simulation" to see results
                </p>
              </div>
            </div>
          )}

          {!loading && simulationResults && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Simulation Results</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{simulationResults.total_profit?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Profit</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {simulationResults.efficiency_score}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {simulationResults.total_deliveries}
                    </div>
                    <div className="text-sm text-gray-600">Deliveries</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{simulationResults.total_fuel_cost?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Fuel Cost</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Simulation ID:</strong> {simulationResults.simulation_id} •{' '}
                  <strong>Execution Time:</strong> {simulationResults.execution_time_ms}ms
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeliveryChart simulationData={simulationResults} />
                <FuelCostChart simulationData={simulationResults} />
              </div>

              {/* Driver Assignments */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Assignments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulationResults.driver_assignments?.map((driver, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{driver.driver_name}</h4>
                        {driver.is_fatigued && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Fatigued
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Orders: {driver.orders_assigned?.length || 0}</div>
                        <div>Hours: {driver.total_hours_worked || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation History */}
      {simulationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {simulationHistory.map((sim) => (
                  <tr key={sim.simulation_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {sim.simulation_id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ₹{sim.results?.total_profit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sim.results?.efficiency_score}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sim.results?.total_deliveries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationPage;
