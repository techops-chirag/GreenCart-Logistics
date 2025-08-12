import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const FuelCostChart = ({ simulationData, simulationHistory = [] }) => {
  if (!simulationData && simulationHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No fuel cost data available</p>
      </div>
    );
  }

  // If we have simulation history, show trend
  if (simulationHistory.length > 0) {
    const trendData = {
      labels: simulationHistory.map((sim, index) => `Sim ${index + 1}`),
      datasets: [
        {
          label: 'Fuel Cost (₹)',
          data: simulationHistory.map(sim => sim.results?.total_fuel_cost || 0),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total Profit (₹)',
          data: simulationHistory.map(sim => sim.results?.total_profit || 0),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }
      ]
    };

    const trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Fuel Cost vs Profit Trend'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-64">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>
    );
  }

  // Single simulation breakdown
  const { total_fuel_cost, total_profit, total_penalties, total_bonuses } = simulationData;

  const breakdownData = {
    labels: ['Fuel Costs', 'Penalties', 'Bonuses', 'Net Profit'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [total_fuel_cost, total_penalties, total_bonuses, total_profit],
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',  // Orange for fuel
          'rgba(239, 68, 68, 0.8)',   // Red for penalties
          'rgba(34, 197, 94, 0.8)',   // Green for bonuses
          'rgba(59, 130, 246, 0.8)'   // Blue for profit
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  const breakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Financial Breakdown',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-64">
        <Bar data={breakdownData} options={breakdownOptions} />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-orange-50 p-3 rounded">
          <div className="text-lg font-bold text-orange-600">₹{total_fuel_cost?.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Fuel Costs</div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-lg font-bold text-red-600">₹{total_penalties?.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Penalties</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-lg font-bold text-green-600">₹{total_bonuses?.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Bonuses</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-lg font-bold text-blue-600">₹{total_profit?.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Net Profit</div>
        </div>
      </div>
    </div>
  );
};

export default FuelCostChart;
