import React, { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  PlayIcon,
  BookOpenIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  LightBulbIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { designTokens, getParameterColor } from '../../../styles/designTokens';

const ParameterTesting = () => {
  const [currentParameters, setCurrentParameters] = useState({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1000,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    model: 'gpt-4'
  });

  const [activePreset, setActivePreset] = useState('balanced');
  const [testPrompt, setTestPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');

  const parameterPresets = [
    {
      id: 'creative',
      name: 'Creative Writing',
      description: 'High creativity and variability',
      icon: SparklesIcon,
      color: 'from-pink-500 to-rose-500',
      parameters: {
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: 1500,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Optimal for most use cases',
      icon: AdjustmentsHorizontalIcon,
      color: 'from-blue-500 to-cyan-500',
      parameters: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }
    },
    {
      id: 'technical',
      name: 'Technical/Factual',
      description: 'Precise and consistent',
      icon: CpuChipIcon,
      color: 'from-emerald-500 to-teal-500',
      parameters: {
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 800,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }
    },
    {
      id: 'analytical',
      name: 'Analytical',
      description: 'Deep analysis and reasoning',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-indigo-500',
      parameters: {
        temperature: 0.5,
        top_p: 0.85,
        max_tokens: 1200,
        frequency_penalty: 0.0,
        presence_penalty: 0.1
      }
    }
  ];

  const parameterInfo = {
    temperature: {
      name: 'Temperature',
      description: 'Controls randomness. Higher values make output more creative but less focused.',
      min: 0,
      max: 2,
      step: 0.1,
      personality: 'creativity'
    },
    top_p: {
      name: 'Top-p (Nucleus Sampling)',
      description: 'Controls diversity. Lower values make responses more focused.',
      min: 0,
      max: 1,
      step: 0.05,
      personality: 'focus'
    },
    max_tokens: {
      name: 'Max Tokens',
      description: 'Maximum length of the response.',
      min: 100,
      max: 4000,
      step: 50,
      personality: 'length'
    },
    frequency_penalty: {
      name: 'Frequency Penalty',
      description: 'Reduces repetition based on frequency.',
      min: -2,
      max: 2,
      step: 0.1,
      personality: 'repetition'
    },
    presence_penalty: {
      name: 'Presence Penalty',
      description: 'Encourages new topics and ideas.',
      min: -2,
      max: 2,
      step: 0.1,
      personality: 'novelty'
    }
  };

  const applyPreset = (preset) => {
    setCurrentParameters(prev => ({ ...prev, ...preset.parameters }));
    setActivePreset(preset.id);
  };

  const updateParameter = (key, value) => {
    setCurrentParameters(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  };

  const generateResponse = async () => {
    if (!testPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedResponse(`This is a simulated response generated with the current parameters. Temperature: ${currentParameters.temperature}, Top-p: ${currentParameters.top_p}, Max tokens: ${currentParameters.max_tokens}.`);
      setIsGenerating(false);
    }, 2000);
  };

  const ParameterSlider = ({ paramKey, parameter }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{parameter.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{parameter.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: getParameterColor(parameter.personality) }}>
            {currentParameters[paramKey]}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {parameter.personality}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <input
          type="range"
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          value={currentParameters[paramKey]}
          onChange={(e) => updateParameter(paramKey, parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${getParameterColor(parameter.personality)} 0%, ${getParameterColor(parameter.personality)} ${((currentParameters[paramKey] - parameter.min) / (parameter.max - parameter.min)) * 100}%, #e2e8f0 ${((currentParameters[paramKey] - parameter.min) / (parameter.max - parameter.min)) * 100}%, #e2e8f0 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{parameter.min}</span>
          <span>{parameter.max}</span>
        </div>
      </div>
    </div>
  );

  const PresetCard = ({ preset }) => {
    const Icon = preset.icon;
    const isActive = activePreset === preset.id;
    
    return (
      <button
        onClick={() => applyPreset(preset)}
        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
          isActive 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${preset.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {preset.name}
            </h3>
            <p className={`text-sm mt-1 ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
              {preset.description}
            </p>
            <div className="flex items-center space-x-3 mt-3 text-xs">
              <span className="text-gray-500">Temp: {preset.parameters.temperature}</span>
              <span className="text-gray-500">Top-p: {preset.parameters.top_p}</span>
              <span className="text-gray-500">Tokens: {preset.parameters.max_tokens}</span>
            </div>
          </div>
          {isActive && (
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parameter Testing</h1>
          <p className="text-gray-600 mt-2">Configure and test LLM parameters for optimal response quality</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <BookOpenIcon className="w-4 h-4" />
            <span>Parameter Guide</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Presets */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Parameter Presets</h2>
            <div className="space-y-3">
              {parameterPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Selection</h3>
            <select 
              value={currentParameters.model}
              onChange={(e) => updateParameter('model', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude-3</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
        </div>

        {/* Middle Column - Parameter Controls */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Parameter Controls</h2>
          {Object.entries(parameterInfo).map(([key, param]) => (
            <ParameterSlider key={key} paramKey={key} parameter={param} />
          ))}
        </div>

        {/* Right Column - Test Interface */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Test Interface</h2>
          
          {/* Test Prompt */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Prompt</h3>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter your test prompt here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={generateResponse}
              disabled={!testPrompt.trim() || isGenerating}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Generate Response</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Response */}
          {generatedResponse && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Response</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                {generatedResponse}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Analyze Quality</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Save Result</span>
                </button>
              </div>
            </div>
          )}

          {/* Parameter Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
            <div className="space-y-3">
              {Object.entries(currentParameters).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {typeof value === 'number' ? value.toFixed(key === 'max_tokens' ? 0 : 2) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterTesting;
