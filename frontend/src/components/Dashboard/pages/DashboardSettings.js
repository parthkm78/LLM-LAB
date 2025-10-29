import React from 'react';
import { Cog6ToothIcon, SparklesIcon } from '@heroicons/react/24/outline';

const DashboardSettings = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Cog6ToothIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Settings</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Customize your dashboard experience, configure notifications, and manage user preferences and integrations.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
            Coming in Phase 2
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <SparklesIcon className="w-5 h-5" />
            <span>Personalization Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
