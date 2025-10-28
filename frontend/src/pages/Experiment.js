import React, { useState } from 'react';
import { 
  BeakerIcon, 
  PlayIcon, 
  AdjustmentsHorizontalIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const Experiment = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(500);
  const [results, setResults] = useState(null);

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
        response: "This is a sample response from the LLM. The quality of this response depends on the parameters you've set. With a temperature of " + temperature + " and top_p of " + topP + ", the model generates text with varying creativity and focus.",
        metrics: {
          coherence: 85,
          completeness: 92,
          readability: 88,
          relevance: 90
        },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top P: {topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Narrow</span>
                  <span>Diverse</span>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min="50"
                  max="2000"
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRunExperiment}
              disabled={isRunning || !prompt.trim()}
              className="w-full sm:w-auto"
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

          {/* Results */}
          {results && (
            <Card className="p-4 sm:p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                Generated Response
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{results.response}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Object.entries(results.metrics).map(([metric, score]) => (
                  <div key={metric} className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{score}%</div>
                    <div className="text-xs sm:text-sm text-gray-600 capitalize">{metric}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Parameter Guide
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Temperature</h4>
                <p className="text-sm text-gray-600">Controls randomness. Lower = more focused, higher = more creative.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Top P</h4>
                <p className="text-sm text-gray-600">Nucleus sampling. Lower = more focused vocabulary, higher = more diverse.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Max Tokens</h4>
                <p className="text-sm text-gray-600">Maximum length of the generated response.</p>
              </div>
            </div>
          </Card>

          {results && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Execution Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Execution Time</span>
                  <span className="font-medium">{results.executionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens Used</span>
                  <span className="font-medium">{results.tokenUsage.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prompt Tokens</span>
                  <span className="font-medium">{results.tokenUsage.prompt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Tokens</span>
                  <span className="font-medium">{results.tokenUsage.completion}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Experiment;
