import React from 'react';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ResponseComparison = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <DocumentTextIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Response Comparison</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Side-by-side comparison of multiple LLM responses with detailed quality breakdowns and insights.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium">
            Coming in Phase 2
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <SparklesIcon className="w-5 h-5" />
            <span>Advanced Comparison Tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseComparison;
