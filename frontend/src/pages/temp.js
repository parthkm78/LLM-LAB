import React, { useState } from 'react';
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

const Experiment = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
    model: 'gpt-3.5-turbo',
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  });
  const [results, setResults] = useState(null);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results
      setResults({
        response: `This is a sample response from the LLM. The quality of this response depends on the parameters you've set. With a temperature of ${parameters.temperature} and top_p of ${parameters.top_p}, the model generates text with varying creativity and focus. The frequency penalty of ${parameters.frequency_penalty} and presence penalty of ${parameters.presence_penalty} also influence repetition and topic diversity.`,
        metrics: {
          coherence: 85,
          completeness: 92,
          readability: 88,
          creativity: Math.floor(70 + parameters.temperature * 20),
          specificity: Math.floor(90 - parameters.frequency_penalty * 10),
          overall: 85
        },
        parameters: parameters,
        executionTime: '2.3s',
        tokenUsage: {
          prompt: 25,
          completion: 156,
          total: 181
        }
      });
    } catch (error) {
      console.error('Experiment failed:', error);
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
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CpuChipIcon className="w-4 h-4 inline mr-1" />
                  Model
                </label>
                <select
                  value={parameters.model}
                  onChange={(e) => handleParameterChange('model', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRunning}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the LLM model for generation</p>
              </div>

              {/* Core Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Temperature */}
                <div className="bg-gradient-to-br from-red-50 to-yellow-50 p-4 rounded-lg border border-red-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌡️ Temperature: {parameters.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={parameters.temperature}
                    onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-blue-400 to-red-400 rounded-lg appearance-none cursor-pointer"
                    disabled={isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused (0)</span>
                    <span>Balanced (1)</span>
                    <span>Creative (2)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Controls randomness: higher = more creative</p>
                </div>

                {/* Top-p */}
                <div className="bg-gradient-to-br from-purple-50 to-green-50 p-4 rounded-lg border border-purple-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Top-p: {parameters.top_p}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={parameters.top_p}
                    onChange={(e) => handleParameterChange('top_p', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-purple-400 to-green-400 rounded-lg appearance-none cursor-pointer"
                    disabled={isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused (0.1)</span>
                    <span>Diverse (1.0)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Controls diversity: lower = more focused</p>
                </div>

                {/* Frequency Penalty */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔄 Frequency Penalty: {parameters.frequency_penalty}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={parameters.frequency_penalty}
                    onChange={(e) => handleParameterChange('frequency_penalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-gray-400 to-orange-400 rounded-lg appearance-none cursor-pointer"
                    disabled={isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No penalty (0)</span>
                    <span>High penalty (2)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Reduces repetition of frequent words</p>
                </div>

                {/* Presence Penalty */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎭 Presence Penalty: {parameters.presence_penalty}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={parameters.presence_penalty}
                    onChange={(e) => handleParameterChange('presence_penalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-gray-400 to-teal-400 rounded-lg appearance-none cursor-pointer"
                    disabled={isRunning}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No penalty (0)</span>
                    <span>High penalty (2)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Encourages talking about new topics</p>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Max Tokens: {parameters.max_tokens}
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={parameters.max_tokens}
                  onChange={(e) => handleParameterChange('max_tokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Short (50)</span>
                  <span>Medium (1000)</span>
                  <span>Long (2000)</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">Maximum length of the response</p>
              </div>
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRunExperiment}
              disabled={isRunning || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
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
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Parameter Summary */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentChartBarIcon className="w-5 h-5 mr-2" />
              Current Parameters
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Model:</span>
                <span className="text-sm font-medium">{parameters.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Temperature:</span>
                <span className="text-sm font-medium">{parameters.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Top-p:</span>
                <span className="text-sm font-medium">{parameters.top_p}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Freq. Penalty:</span>
                <span className="text-sm font-medium">{parameters.frequency_penalty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pres. Penalty:</span>
                <span className="text-sm font-medium">{parameters.presence_penalty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Tokens:</span>
                <span className="text-sm font-medium">{parameters.max_tokens}</span>
              </div>
            </div>
          </Card>

          {/* Results */}
          {results && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Results
              </h3>
              
              {/* Response */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Generated Response</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  {results.response}
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  {Object.entries(results.metrics).map(([metric, score]) => (
                    <div key={metric} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-gray-600">
                        {metric.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Usage */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Usage Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="font-medium ml-2">{results.executionTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Tokens:</span>
                    <span className="font-medium ml-2">{results.tokenUsage.total}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Parameter Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Higher temperature = more creative, unpredictable</li>
                  <li>• Lower top-p = more focused responses</li>
                  <li>• Frequency penalty reduces word repetition</li>
                  <li>• Presence penalty encourages new topics</li>
                  <li>• Adjust max tokens based on desired length</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Experiment;
