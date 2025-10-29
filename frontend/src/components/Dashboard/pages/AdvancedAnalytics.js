import React from 'react';
import { PresentationChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

const AdvancedAnalytics = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PresentationChartBarIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Deep insights with trend analysis, parameter correlations, and predictive modeling for optimal LLM performance.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-amber-100 text-amber-700 rounded-lg font-medium">
            Coming in Phase 2
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <SparklesIcon className="w-5 h-5" />
            <span>AI-Powered Insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
