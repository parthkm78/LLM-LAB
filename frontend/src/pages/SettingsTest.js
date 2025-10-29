import React from 'react';

const SettingsTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings Page Test</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">This is a test settings page to verify the routing works.</p>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
            <ul className="space-y-2">
              <li>• Frontend running on port 3001</li>
              <li>• Backend running on port 5000</li>
              <li>• Settings page is accessible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTest;
