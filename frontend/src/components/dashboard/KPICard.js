import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendValue, 
  icon: Icon,
  color = 'blue',
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (unit === '₹') {
        return val.toLocaleString();
      }
      if (unit === '%') {
        return val.toFixed(1);
      }
      return val.toLocaleString();
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border transition-all duration-200 hover:shadow-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      
      <div className="flex items-baseline">
        <div className="text-3xl font-bold text-gray-900">
          {unit === '₹' && unit}
          {formatValue(value)}
          {unit !== '₹' && unit}
        </div>
      </div>

      {(trend || trendValue) && (
        <div className="flex items-center mt-2 text-sm">
          {getTrendIcon()}
          <span className={`ml-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {trendValue ? `${trendValue}%` : 'No change'} from last simulation
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
