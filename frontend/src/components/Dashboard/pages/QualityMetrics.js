import React from 'react';
import { ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

const QualityMetrics = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ChartBarIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Metrics</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Advanced quality analysis with comprehensive metrics, trend analysis, and intelligent insights.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
            Coming in Phase 2
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <SparklesIcon className="w-5 h-5" />
            <span>Enhanced Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMetrics;
