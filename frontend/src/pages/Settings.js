import React from 'react';
import Layout from '../components/Layout/Layout';
import ProviderManager from '../components/ProviderManager';
import Card from '../components/Card';

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure your LLM Response Quality Analyzer preferences and API settings.
            </p>
          </div>

          <div className="space-y-8">
            {/* Provider Management Section */}
            <ProviderManager />

            {/* API Configuration Section */}
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">API Configuration</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        API Keys Configuration
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          API keys are configured in the backend environment file (.env). 
                          To change providers, ensure the corresponding API key is set:
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li>• OpenAI: Set <code className="bg-yellow-200 px-1 rounded">OPENAI_API_KEY</code></li>
                          <li>• Google AI Studio: Set <code className="bg-yellow-200 px-1 rounded">GOOGLE_AI_STUDIO_API_KEY</code></li>
                          <li>• Provider Selection: Set <code className="bg-yellow-200 px-1 rounded">LLM_PROVIDER</code> to 'openai' or 'google'</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Framework:</span>
                        <span className="font-medium">React.js</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">UI Library:</span>
                        <span className="font-medium">Tailwind CSS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Port:</span>
                        <span className="font-medium">3001</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Framework:</span>
                        <span className="font-medium">Node.js + Express</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Database:</span>
                        <span className="font-medium">SQLite</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Port:</span>
                        <span className="font-medium">5000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature Overview */}
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Supported Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">LLM Parameters</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Temperature (0.0 - 1.0)</li>
                      <li>• Top P (0.1 - 1.0)</li>
                      <li>• Frequency Penalty (0.0 - 2.0)</li>
                      <li>• Presence Penalty (0.0 - 2.0)</li>
                      <li>• Max Tokens (1 - 2000)</li>
                      <li>• Model Selection</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Relevance Score</li>
                      <li>• Coherence Rating</li>
                      <li>• Fluency Assessment</li>
                      <li>• Informativeness Level</li>
                      <li>• Creativity Index</li>
                      <li>• Overall Quality Score</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
