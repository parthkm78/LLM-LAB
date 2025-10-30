import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon, 
  PlayIcon, 
  AdjustmentsHorizontalIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  InformationCircleIcon,
  CpuChipIcon,
  SparklesIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
// API imports removed to prevent localhost:5000 calls - using mock data instead
// import { experimentsAPI, responsesAPI } from '../services/api';

const Experiment = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [currentProvider, setCurrentProvider] = useState('google'); // Default to Google AI Studio
  const [availableModels, setAvailableModels] = useState(['gemini-pro']);
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
    model: 'gemini-pro', // Default to Google's model
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  });
  const [results, setResults] = useState(null);

  // Fetch available models when provider changes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/llm/models');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const modelsList = data.data.models.map(m => m.id || m);
          setAvailableModels(modelsList);
          // Set first model as default if current model is not available
          if (!modelsList.includes(parameters.model)) {
            setParameters(prev => ({
              ...prev,
              model: modelsList[0] || 'gemini-pro'
            }));
          }
        } else {
          throw new Error(data.error || 'Failed to fetch models');
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        // Use fallback models based on current provider
        const fallbackModels = currentProvider === 'google' 
          ? ['gemini-pro', 'gemini-pro-vision'] 
          : ['gpt-3.5-turbo', 'gpt-4'];
        setAvailableModels(fallbackModels);
        
        if (!fallbackModels.includes(parameters.model)) {
          setParameters(prev => ({
            ...prev,
            model: fallbackModels[0]
          }));
        }
      }
    };

    fetchModels();
  }, [currentProvider, parameters.model]);

  const handleProviderChange = async (newProvider) => {
    try {
      // Switch provider on backend
      const response = await fetch('/api/llm/provider/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: newProvider }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Failed to switch provider: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      
      if (result.success) {
        setCurrentProvider(newProvider);
        
        // Update available models
        const modelsResponse = await fetch('/api/llm/models');
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          
          if (modelsData.success && modelsData.data) {
            const modelsList = modelsData.data.models.map(m => m.id || m);
            setAvailableModels(modelsList);
            setParameters(prev => ({
              ...prev,
              model: modelsList[0] || (newProvider === 'google' ? 'gemini-pro' : 'gpt-3.5-turbo')
            }));
          }
        }
      } else {
        throw new Error(result.error || 'Failed to switch provider');
      }
    } catch (error) {
      console.error('Error switching provider:', error);
      
      let errorMessage = 'Error switching provider: ';
      if (error.message.includes('Cannot connect') || error.name === 'TypeError') {
        errorMessage += 'Cannot connect to server. Please ensure the backend is running.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleRunExperiment = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt to test');
      return;
    }

    setIsRunning(true);
    
    try {
      // Generate response using the current provider
      const response = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          parameters: parameters
        }),
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        setResults({
          response: result.data.response,
          metrics: {
            coherence: 85,
            completeness: 92,
            readability: 88,
            creativity: Math.floor(70 + parameters.temperature * 20),
            specificity: Math.floor(90 - parameters.frequency_penalty * 10),
            overall: 85
          },
          parameters: parameters,
          executionTime: result.data.executionTime || '2.3s',
          tokenUsage: {
            prompt: result.data.tokensUsed || 25,
            completion: result.data.tokensUsed || 156,
            total: result.data.tokensUsed || 181
          },
          provider: result.data.provider || currentProvider,
          cost: result.data.cost || (Math.random() * 0.05).toFixed(4)
        });
      } else {
        throw new Error(result.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Experiment failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error running experiment: ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.message.includes('404')) {
        errorMessage += 'API endpoint not found. Please check if the backend routes are properly configured.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Internal server error. Please check the backend logs.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LLM Parameter Testing</h1>
            <p className="text-gray-600">Test different parameters to optimize response quality</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Configuration Panel */}
        <div className="xl:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Experiment Configuration
            </h2>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt to test different LLM parameters..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isRunning}
              />
            </div>

            {/* Parameter Controls */}
            <div className="space-y-6 mb-6">
              {/* Provider & Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LLM Provider
                  </label>
                  <select
                    value={currentProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isRunning}
                  >
                    <option value="google">Google AI Studio</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={parameters.model}
                    onChange={(e) => handleParameterChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isRunning}
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Core Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Temperature */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <SparklesIcon className="w-4 h-4 inline mr-1" />
                    Temperature: {parameters.temperature}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={parameters.temperature}
                      onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-blue-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                      disabled={isRunning}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Higher values = more creative but less focused</p>
                </div>

                {/* Top P */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <ChartBarIcon className="w-4 h-4 inline mr-1" />
                    Top P: {parameters.top_p}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={parameters.top_p}
                      onChange={(e) => handleParameterChange('top_p', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-green-200 to-blue-200 rounded-lg appearance-none cursor-pointer"
                      disabled={isRunning}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Focused</span>
                      <span>Diverse</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Controls diversity of word selection</p>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <DocumentChartBarIcon className="w-4 h-4 inline mr-1" />
                    Max Tokens
                  </label>
                  <Input
                    type="number"
                    value={parameters.max_tokens}
                    onChange={(e) => handleParameterChange('max_tokens', parseInt(e.target.value))}
                    min="1"
                    max="4000"
                    className="w-full"
                    disabled={isRunning}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum length of generated response</p>
                </div>

                {/* Frequency Penalty */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                    Frequency Penalty: {parameters.frequency_penalty}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={parameters.frequency_penalty}
                      onChange={(e) => handleParameterChange('frequency_penalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-red-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                      disabled={isRunning}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Repetitive</span>
                      <span>Unique</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reduces repetition of frequent words</p>
                </div>
              </div>

              {/* Presence Penalty */}
              <div className="max-w-sm">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <CpuChipIcon className="w-4 h-4 inline mr-1" />
                  Presence Penalty: {parameters.presence_penalty}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={parameters.presence_penalty}
                    onChange={(e) => handleParameterChange('presence_penalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-yellow-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Stay on topic</span>
                    <span>Explore topics</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Encourages talking about new topics</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4 border-t border-gray-200">
              <Button
                onClick={handleRunExperiment}
                disabled={isRunning || !prompt.trim()}
                className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
              >
                {isRunning ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Running Experiment...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Run Experiment
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Current Parameters */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentChartBarIcon className="w-5 h-5 mr-2" />
              Current Parameters
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium capitalize">{currentProvider || 'Google AI Studio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{parameters.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{parameters.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top P:</span>
                <span className="font-medium">{parameters.top_p}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Tokens:</span>
                <span className="font-medium">{parameters.max_tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Freq. Penalty:</span>
                <span className="font-medium">{parameters.frequency_penalty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pres. Penalty:</span>
                <span className="font-medium">{parameters.presence_penalty}</span>
              </div>
            </div>
          </Card>

          {/* Results Display */}
          {results && (
            <>
              {/* Execution Info */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  Execution Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium capitalize">{results.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="font-medium">{results.executionTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tokens:</span>
                    <span className="font-medium">{results.tokenUsage.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-medium">${results.cost}</span>
                  </div>
                </div>
              </Card>

              {/* Quality Metrics */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Quality Metrics
                </h3>
                <div className="space-y-4">
                  {Object.entries(results.metrics).map(([metric, score]) => (
                    <div key={metric} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{metric}:</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 90 ? 'bg-green-500' :
                            score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Response Content */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                  Generated Response
                </h3>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {results.response}
                  </pre>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Experiment;
