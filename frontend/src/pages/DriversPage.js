import React, { useState, useEffect } from 'react';
import { driversAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await driversAPI.getAll();
      setDrivers(response.data.data);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert past_week_hours string to array
      const pastWeekHours = data.past_week_hours.split(',').map(h => parseFloat(h.trim()));
      const driverData = {
        ...data,
        shift_hours: parseInt(data.shift_hours),
        past_week_hours: pastWeekHours
      };

      if (editingDriver) {
        await driversAPI.update(editingDriver._id, driverData);
        toast.success('Driver updated successfully');
      } else {
        await driversAPI.create(driverData);
        toast.success('Driver created successfully');
      }

      setShowModal(false);
      setEditingDriver(null);
      reset();
      loadDrivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    reset({
      name: driver.name,
      shift_hours: driver.shift_hours,
      past_week_hours: driver.past_week_hours.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await driversAPI.delete(id);
      toast.success('Driver deleted successfully');
      setDeleteConfirm(null);
      loadDrivers();
    } catch (error) {
      toast.error('Failed to delete driver');
    }
  };

  const openModal = () => {
    setEditingDriver(null);
    reset();
    setShowModal(true);
  };

  const getDriverStatus = (driver) => {
    const yesterdayHours = driver.past_week_hours[driver.past_week_hours.length - 1];
    const avgHours = driver.past_week_hours.reduce((sum, h) => sum + h, 0) / 7;
    
    if (yesterdayHours > 8) return { status: 'fatigued', color: 'red' };
    if (avgHours > 8) return { status: 'overworked', color: 'orange' };
    return { status: 'available', color: 'green' };
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
          <h1 className="text-3xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-600 mt-1">Manage driver information and work schedules</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          const driverStatus = getDriverStatus(driver);
          const avgHours = (driver.past_week_hours.reduce((sum, h) => sum + h, 0) / 7).toFixed(1);
          
          return (
            <div key={driver._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-600">Shift: {driver.shift_hours} hours</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(driver)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                driverStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                driverStatus.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                {driverStatus.color === 'red' ? <AlertTriangle className="w-3 h-3" /> :
                 driverStatus.color === 'orange' ? <Clock className="w-3 h-3" /> :
                 <CheckCircle className="w-3 h-3" />}
                <span className="capitalize">{driverStatus.status}</span>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Average:</span>
                  <span className="font-medium">{avgHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yesterday:</span>
                  <span className="font-medium">{driver.past_week_hours[6]}h</span>
                </div>
              </div>

              {/* Week Hours Chart */}
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Past 7 Days:</p>
                <div className="flex space-x-1">
                  {driver.past_week_hours.map((hours, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-6 rounded ${hours > 8 ? 'bg-red-200' : 'bg-blue-200'}`}
                      title={`Day ${index + 1}: ${hours}h`}
                    >
                      <div
                        className={`h-full rounded ${hours > 8 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ height: `${Math.min(hours / 12 * 100, 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mon</span>
                  <span>Sun</span>
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
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter driver name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  {...register('shift_hours', { 
                    required: 'Shift hours is required',
                    min: { value: 1, message: 'Minimum 1 hour' },
                    max: { value: 12, message: 'Maximum 12 hours' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8"
                />
                {errors.shift_hours && (
                  <p className="text-red-500 text-sm mt-1">{errors.shift_hours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Past Week Hours (Mon-Sun, comma separated)
                </label>
                <input
                  type="text"
                  {...register('past_week_hours', { 
                    required: 'Past week hours is required',
                    pattern: {
                      value: /^(\d+(\.\d+)?,\s*){6}\d+(\.\d+)?$/,
                      message: 'Enter 7 numbers separated by commas (e.g., 8,7,9,8,7,6,10)'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8, 7, 9, 8, 7, 6, 10"
                />
                {errors.past_week_hours && (
                  <p className="text-red-500 text-sm mt-1">{errors.past_week_hours.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter hours worked each day from Monday to Sunday
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingDriver ? 'Update Driver' : 'Add Driver'}
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
              Are you sure you want to delete driver "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete Driver
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

export default DriversPage;
