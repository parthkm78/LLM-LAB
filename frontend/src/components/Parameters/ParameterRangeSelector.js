import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  BeakerIcon, 
  DocumentTextIcon,
  InformationCircleIcon,
  PlayIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { designTokens, getParameterColor, getParameterGradient } from '../../styles/designTokens';

const ParameterRangeSelector = ({ 
  onParameterChange, 
  onExperimentStart,
  isExperimentRunning = false,
  initialValues = {}
}) => {
  const [ranges, setRanges] = useState({
    temperature: { min: 0.1, max: 1.0, step: 0.1, ...initialValues.temperature },
    top_p: { min: 0.1, max: 1.0, step: 0.1, ...initialValues.top_p },
    max_tokens: { value: 150, ...initialValues.max_tokens }
  });

  const [iterations, setIterations] = useState(3);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  // Parameter presets for different use cases
  const presets = {
    creative: {
      name: 'Creative Writing',
      description: 'High creativity and variety',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-500',
      parameters: {
        temperature: { min: 0.8, max: 1.0, step: 0.1 },
        top_p: { min: 0.9, max: 1.0, step: 0.05 },
        max_tokens: { value: 200 }
      }
    },
    technical: {
      name: 'Technical Documentation',
      description: 'Precise and structured',
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-cyan-500',
      parameters: {
        temperature: { min: 0.2, max: 0.4, step: 0.1 },
        top_p: { min: 0.7, max: 0.9, step: 0.1 },
        max_tokens: { value: 300 }
      }
    },
    balanced: {
      name: 'Balanced Response',
      description: 'Good mix of creativity and accuracy',
      icon: BeakerIcon,
      color: 'from-green-500 to-emerald-500',
      parameters: {
        temperature: { min: 0.5, max: 0.8, step: 0.1 },
        top_p: { min: 0.8, max: 0.95, step: 0.05 },
        max_tokens: { value: 150 }
      }
    },
    custom: {
      name: 'Custom Range',
      description: 'Define your own parameters',
      icon: Cog6ToothIcon,
      color: 'from-gray-500 to-gray-600',
      parameters: ranges
    }
  };

  // Calculate experiment matrix size
  const calculateCombinations = () => {
    const tempSteps = Math.round((ranges.temperature.max - ranges.temperature.min) / ranges.temperature.step) + 1;
    const topPSteps = Math.round((ranges.top_p.max - ranges.top_p.min) / ranges.top_p.step) + 1;
    return tempSteps * topPSteps;
  };

  const totalResponses = calculateCombinations() * iterations;

  // Handle range changes
  const handleRangeChange = (param, field, value) => {
    const newRanges = {
      ...ranges,
      [param]: { ...ranges[param], [field]: value }
    };
    setRanges(newRanges);
    setSelectedPreset('custom');
    onParameterChange?.(newRanges);
  };

  // Apply preset
  const applyPreset = (presetKey) => {
    if (presetKey === 'custom') return;
    
    const preset = presets[presetKey];
    setRanges(preset.parameters);
    setSelectedPreset(presetKey);
    onParameterChange?.(preset.parameters);
  };

  // Start experiment
  const handleStartExperiment = () => {
    onExperimentStart?.({
      parameters: ranges,
      iterations,
      totalResponses,
      estimatedTime: Math.ceil(totalResponses * 2) // 2 seconds per response estimate
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary-500" />
          Parameter Presets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === key;
            
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg bg-gradient-to-r ${preset.color}
                  `}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 text-sm">{preset.name}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{preset.description}</p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full bg-primary-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Control */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
              <FireIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Temperature</h4>
              <p className="text-xs text-neutral-500">Controls randomness and creativity</p>
            </div>
            <button className="ml-auto p-1 text-neutral-400 hover:text-neutral-600">
              <InformationCircleIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={ranges.temperature.min}
                  onChange={(e) => handleRangeChange('temperature', 'min', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={ranges.temperature.max}
                  onChange={(e) => handleRangeChange('temperature', 'max', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Step</label>
                <input
                  type="number"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={ranges.temperature.step}
                  onChange={(e) => handleRangeChange('temperature', 'step', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Visual range slider */}
            <div className="relative">
              <div className="h-2 bg-neutral-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  style={{ 
                    marginLeft: `${(ranges.temperature.min / 2) * 100}%`,
                    width: `${((ranges.temperature.max - ranges.temperature.min) / 2) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>0.0 (Focused)</span>
                <span>2.0 (Creative)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top-p Control */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <BeakerIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Top-p (Nucleus)</h4>
              <p className="text-xs text-neutral-500">Controls diversity of word choices</p>
            </div>
            <button className="ml-auto p-1 text-neutral-400 hover:text-neutral-600">
              <InformationCircleIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Min</label>
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={ranges.top_p.min}
                  onChange={(e) => handleRangeChange('top_p', 'min', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Max</label>
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={ranges.top_p.max}
                  onChange={(e) => handleRangeChange('top_p', 'max', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">Step</label>
                <input
                  type="number"
                  min="0.05"
                  max="0.2"
                  step="0.05"
                  value={ranges.top_p.step}
                  onChange={(e) => handleRangeChange('top_p', 'step', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Visual range slider */}
            <div className="relative">
              <div className="h-2 bg-neutral-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ 
                    marginLeft: `${ranges.top_p.min * 100}%`,
                    width: `${(ranges.top_p.max - ranges.top_p.min) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>0.1 (Precise)</span>
                <span>1.0 (Diverse)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment Configuration */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg p-6">
        <h4 className="font-semibold text-neutral-900 mb-4">Experiment Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Max Tokens</label>
            <input
              type="number"
              min="50"
              max="1000"
              step="50"
              value={ranges.max_tokens.value}
              onChange={(e) => handleRangeChange('max_tokens', 'value', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Iterations */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Iterations per Parameter</label>
            <select
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={1}>1 iteration</option>
              <option value={3}>3 iterations</option>
              <option value={5}>5 iterations</option>
              <option value={10}>10 iterations</option>
            </select>
          </div>

          {/* Experiment Summary */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-neutral-700 mb-2">Experiment Size</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Combinations:</span>
                <span className="font-medium">{calculateCombinations()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Responses:</span>
                <span className="font-medium text-primary-600">{totalResponses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Est. Time:</span>
                <span className="font-medium">{Math.ceil(totalResponses * 2 / 60)}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Experiment Button */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <button
            onClick={handleStartExperiment}
            disabled={isExperimentRunning}
            className={`
              w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200
              ${isExperimentRunning
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isExperimentRunning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-400 border-t-transparent" />
                Running Experiment...
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                Start Parameter Experiment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterRangeSelector;
