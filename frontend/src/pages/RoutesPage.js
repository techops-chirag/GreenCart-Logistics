import React, { useState, useEffect } from 'react';
import { routesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Navigation,
  Fuel,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.data);
    } catch (error) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const routeData = {
        route_id: parseInt(data.route_id),
        distance_km: parseFloat(data.distance_km),
        traffic_level: data.traffic_level,
        base_time_min: parseInt(data.base_time_min)
      };

      if (editingRoute) {
        await routesAPI.update(editingRoute._id, routeData);
        toast.success('Route updated successfully');
      } else {
        await routesAPI.create(routeData);
        toast.success('Route created successfully');
      }

      setShowModal(false);
      setEditingRoute(null);
      reset();
      loadRoutes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    reset({
      route_id: route.route_id,
      distance_km: route.distance_km,
      traffic_level: route.traffic_level,
      base_time_min: route.base_time_min
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await routesAPI.delete(id);
      toast.success('Route deleted successfully');
      setDeleteConfirm(null);
      loadRoutes();
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const openModal = () => {
    setEditingRoute(null);
    reset();
    setShowModal(true);
  };

  const getTrafficColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateFuelCost = (distance, trafficLevel) => {
    const baseCost = distance * 5;
    const surcharge = trafficLevel === 'High' ? distance * 2 : 0;
    return baseCost + surcharge;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
          <p className="text-gray-600 mt-1">Manage delivery routes and traffic conditions</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => {
          const fuelCost = calculateFuelCost(route.distance_km, route.traffic_level);
          
          return (
            <div key={route._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Route #{route.route_id}</h3>
                  <p className="text-sm text-gray-600">{route.distance_km} km distance</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(route)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(route)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Traffic Level Badge */}
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getTrafficColor(route.traffic_level)}`}>
                <Navigation className="w-4 h-4" />
                <span>{route.traffic_level} Traffic</span>
              </div>

              {/* Route Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Base Time:</span>
                  </div>
                  <span className="font-medium">{route.base_time_min} min</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Distance:</span>
                  </div>
                  <span className="font-medium">{route.distance_km} km</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Fuel Cost:</span>
                  </div>
                  <span className="font-medium">₹{fuelCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Efficiency Indicators */}
              <div className="mt-4 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">
                      {(route.distance_km / (route.base_time_min / 60)).toFixed(1)} km/h
                    </div>
                    <div className="text-gray-500">Avg Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">
                      ₹{(fuelCost / route.distance_km).toFixed(1)}/km
                    </div>
                    <div className="text-gray-500">Cost per km</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route ID
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('route_id', { 
                    required: 'Route ID is required',
                    min: { value: 1, message: 'Route ID must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter route ID"
                  disabled={editingRoute !== null}
                />
                {errors.route_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register('distance_km', { 
                    required: 'Distance is required',
                    min: { value: 0.1, message: 'Distance must be at least 0.1 km' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter distance in kilometers"
                />
                {errors.distance_km && (
                  <p className="text-red-500 text-sm mt-1">{errors.distance_km.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Level
                </label>
                <select
                  {...register('traffic_level', { required: 'Traffic level is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select traffic level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.traffic_level && (
                  <p className="text-red-500 text-sm mt-1">{errors.traffic_level.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('base_time_min', { 
                    required: 'Base time is required',
                    min: { value: 1, message: 'Base time must be at least 1 minute' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter base delivery time in minutes"
                />
                {errors.base_time_min && (
                  <p className="text-red-500 text-sm mt-1">{errors.base_time_min.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingRoute ? 'Update Route' : 'Add Route'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Route #{deleteConfirm.route_id}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete Route
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
