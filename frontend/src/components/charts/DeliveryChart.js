import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DeliveryChart = ({ simulationData, chartType = 'bar' }) => {
  if (!simulationData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No simulation data available</p>
      </div>
    );
  }

  const { on_time_deliveries, late_deliveries, total_deliveries } = simulationData;

  // Bar chart configuration
  const barData = {
    labels: ['On-Time Deliveries', 'Late Deliveries'],
    datasets: [
      {
        label: 'Number of Deliveries',
        data: [on_time_deliveries, late_deliveries],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for on-time
          'rgba(239, 68, 68, 0.8)'  // Red for late
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  // Doughnut chart configuration
  const doughnutData = {
    labels: ['On-Time', 'Late'],
    datasets: [
      {
        data: [on_time_deliveries, late_deliveries],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Delivery Performance Overview',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = total_deliveries > 0 
              ? ((context.parsed || context.raw) / total_deliveries * 100).toFixed(1)
              : 0;
            return `${context.label}: ${context.parsed || context.raw} (${percentage}%)`;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    } : undefined
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-64">
        {chartType === 'bar' ? (
          <Bar data={barData} options={chartOptions} />
        ) : (
          <Doughnut data={doughnutData} options={chartOptions} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded">
          <div className="text-2xl font-bold text-green-600">{on_time_deliveries}</div>
          <div className="text-sm text-gray-600">On-Time</div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-2xl font-bold text-red-600">{late_deliveries}</div>
          <div className="text-sm text-gray-600">Late</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-2xl font-bold text-blue-600">{total_deliveries}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChart;
