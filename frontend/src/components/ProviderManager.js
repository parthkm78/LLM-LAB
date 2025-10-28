import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const ProviderManager = () => {
  const [currentProvider, setCurrentProvider] = useState('');
  const [mockMode, setMockMode] = useState(false);
  const [supportedProviders, setSupportedProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchProviderInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/llm/provider`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentProvider(data.data.currentProvider);
        setMockMode(data.data.mockMode);
        setSupportedProviders(data.data.supportedProviders);
      }
    } catch (err) {
      setError('Failed to fetch provider information');
      console.error('Error fetching provider info:', err);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/llm/models`);
      const data = await response.json();
      
      if (data.success) {
        setModels(data.data.models);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  useEffect(() => {
    fetchProviderInfo();
    fetchModels();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus(null);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/llm/test-connection`);
      const data = await response.json();
      
      setConnectionStatus(data.data);
    } catch (err) {
      setError('Failed to test connection');
      console.error('Error testing connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchProvider = async (newProvider) => {
    if (newProvider === currentProvider) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/llm/provider/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: newProvider }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentProvider(newProvider);
        setMockMode(data.data.mockMode);
        await fetchModels(); // Refresh models for new provider
        setConnectionStatus(null); // Clear previous connection status
      } else {
        setError(data.error || 'Failed to switch provider');
      }
    } catch (err) {
      setError('Failed to switch provider');
      console.error('Error switching provider:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProviderDisplayName = (provider) => {
    const names = {
      openai: 'OpenAI',
      google: 'Google AI Studio'
    };
    return names[provider] || provider;
  };

  const getConnectionStatusColor = (status) => {
    if (!status) return 'gray';
    if (status.success) return 'green';
    if (status.mock) return 'yellow';
    return 'red';
  };

  const getConnectionStatusText = (status) => {
    if (!status) return 'Not tested';
    if (status.mock) return 'Mock mode active';
    if (status.success) return 'Connected';
    return 'Connection failed';
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">LLM Provider Management</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Current Provider Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Provider: {getProviderDisplayName(currentProvider)}
                </h3>
                <p className="text-sm text-gray-600">
                  Mode: {mockMode ? 'Mock' : 'Live API'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full bg-${getConnectionStatusColor(connectionStatus)}-500`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {getConnectionStatusText(connectionStatus)}
                  </span>
                </div>
                
                <Button
                  onClick={testConnection}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Test Connection'}
                </Button>
              </div>
            </div>

            {connectionStatus && !connectionStatus.success && connectionStatus.message && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">{connectionStatus.message}</p>
              </div>
            )}
          </div>

          {/* Provider Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Switch Provider</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportedProviders.map((provider) => (
                <div
                  key={provider}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentProvider === provider
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => switchProvider(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getProviderDisplayName(provider)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {provider === 'openai' && 'GPT models (3.5, 4, 4-turbo)'}
                        {provider === 'google' && 'Gemini models (Pro, Pro Vision)'}
                      </p>
                    </div>
                    
                    {currentProvider === provider && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Models */}
          {models.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Available Models for {getProviderDisplayName(currentProvider)}
              </h3>
              <div className="space-y-2">
                {models.map((model) => (
                  <div key={model.id} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.description}</p>
                      </div>
                      <code className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {model.id}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProviderManager;
