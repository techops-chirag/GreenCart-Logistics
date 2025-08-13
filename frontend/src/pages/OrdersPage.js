import React, { useState, useEffect } from 'react';
import { ordersAPI, routesAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadOrders();
    loadRoutes();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Failed to load routes for dropdown');
    }
  };

  const onSubmit = async (data) => {
    try {
      const orderData = {
        order_id: parseInt(data.order_id),
        value_rs: parseInt(data.value_rs),
        route_id: parseInt(data.route_id),
        delivery_time: data.delivery_time
      };

      if (editingOrder) {
        await ordersAPI.update(editingOrder._id, orderData);
        toast.success('Order updated successfully');
      } else {
        await ordersAPI.create(orderData);
        toast.success('Order created successfully');
      }

      setShowModal(false);
      setEditingOrder(null);
      reset();
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    reset({
      order_id: order.order_id,
      value_rs: order.value_rs,
      route_id: order.route_id,
      delivery_time: order.delivery_time
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await ordersAPI.delete(id);
      toast.success('Order deleted successfully');
      setDeleteConfirm(null);
      loadOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const openModal = () => {
    setEditingOrder(null);
    reset();
    setShowModal(true);
  };

  const getOrderStatus = (order) => {
    switch (order.status) {
      case 'delivered': return { status: 'delivered', color: 'green', icon: CheckCircle };
      case 'late': return { status: 'late', color: 'red', icon: AlertTriangle };
      case 'in_transit': return { status: 'in transit', color: 'blue', icon: TrendingUp };
      default: return { status: 'pending', color: 'gray', icon: Clock };
    }
  };

  const isHighValue = (value) => value > 1000;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Calculate summary stats
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.value_rs, 0);
  const highValueOrders = orders.filter(order => isHighValue(order.value_rs)).length;
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and delivery assignments</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Order</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{highValueOrders}</div>
              <div className="text-sm text-gray-600">High Value Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{Math.round(avgOrderValue).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const orderStatus = getOrderStatus(order);
                const StatusIcon = orderStatus.icon;
                
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-900">#{order.order_id}</div>
                        {isHighValue(order.value_rs) && (
                          <Star className="w-4 h-4 text-yellow-500 ml-2" title="High Value Order" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${isHighValue(order.value_rs) ? 'text-green-600' : 'text-gray-900'}`}>
                        ₹{order.value_rs.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      Route #{order.route_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {order.delivery_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        orderStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                        orderStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                        orderStatus.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{orderStatus.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found. Add your first order to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingOrder ? 'Edit Order' : 'Add New Order'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('order_id', { 
                    required: 'Order ID is required',
                    min: { value: 1, message: 'Order ID must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter order ID"
                  disabled={editingOrder !== null}
                />
                {errors.order_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.order_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Value (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('value_rs', { 
                    required: 'Order value is required',
                    min: { value: 1, message: 'Order value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter order value"
                />
                {errors.value_rs && (
                  <p className="text-red-500 text-sm mt-1">{errors.value_rs.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  {...register('route_id', { required: 'Route is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route.route_id} value={route.route_id}>
                      Route #{route.route_id} ({route.distance_km}km - {route.traffic_level} traffic)
                    </option>
                  ))}
                </select>
                {errors.route_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time
                </label>
                <input
                  type="time"
                  {...register('delivery_time', { required: 'Delivery time is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.delivery_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.delivery_time.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingOrder ? 'Update Order' : 'Add Order'}
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
              Are you sure you want to delete Order #{deleteConfirm.order_id}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Delete Order
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

export default OrdersPage;
