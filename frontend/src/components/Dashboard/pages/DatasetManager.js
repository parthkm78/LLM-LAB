import React from 'react';
import { CircleStackIcon, SparklesIcon } from '@heroicons/react/24/outline';

const DatasetManager = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CircleStackIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Dataset Manager</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Manage test datasets, prompt libraries, and experimental data with version control and collaboration features.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-teal-100 text-teal-700 rounded-lg font-medium">
            Coming in Phase 2
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <SparklesIcon className="w-5 h-5" />
            <span>Smart Data Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetManager;
