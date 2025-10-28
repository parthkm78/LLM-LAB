import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

const MetricsChart = ({ data, type = 'line', title, xKey = 'temperature', yKey = 'score' }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis domain={[0, 1]} />
            <Tooltip 
              formatter={(value) => [(value * 100).toFixed(1) + '%', 'Score']}
              labelFormatter={(label) => `${xKey}: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis domain={[0, 1]} />
            <Tooltip 
              formatter={(value) => [(value * 100).toFixed(1) + '%', 'Score']}
              labelFormatter={(label) => `${xKey}: ${label}`}
            />
            <Legend />
            <Bar dataKey={yKey} fill="#3B82F6" />
          </BarChart>
        );
      
      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis dataKey={yKey} domain={[0, 1]} />
            <Tooltip 
              formatter={(value) => [(value * 100).toFixed(1) + '%', yKey]}
              labelFormatter={(label) => `${xKey}: ${label}`}
            />
            <Scatter dataKey={yKey} fill="#3B82F6" />
          </ScatterChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;
