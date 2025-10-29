import React, { useState, useEffect } from 'react';
import { 
  SquaresPlusIcon, 
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { designTokens, getParameterColor, getQualityColor } from '../../../styles/designTokens';

const BatchExperiments = () => {
  const [batchConfig, setBatchConfig] = useState({
    name: '',
    description: '',
    prompt: '',
    model: 'gpt-4',
    parameterRanges: {
      temperature: { min: 0.1, max: 1.0, step: 0.1 },
      top_p: { min: 0.7, max: 1.0, step: 0.1 },
      max_tokens: { min: 500, max: 2000, step: 250 }
    },
    iterations: 3
  });

  const [batchJobs, setBatchJobs] = useState([
    {
      id: 1,
      name: 'Creative Writing Analysis',
      status: 'completed',
      progress: 100,
      totalCombinations: 120,
      completedCombinations: 120,
      startTime: new Date(Date.now() - 1000 * 60 * 45),
      endTime: new Date(Date.now() - 1000 * 60 * 5),
      bestResult: { quality: 94, temperature: 0.8, top_p: 0.9 },
      averageQuality: 87.5
    },
    {
      id: 2,
      name: 'Technical Documentation Test',
      status: 'running',
      progress: 65,
      totalCombinations: 96,
      completedCombinations: 62,
      startTime: new Date(Date.now() - 1000 * 60 * 20),
      endTime: null,
      bestResult: { quality: 91, temperature: 0.3, top_p: 0.8 },
      averageQuality: 85.2
    },
    {
      id: 3,
      name: 'Code Generation Optimization',
      status: 'queued',
      progress: 0,
      totalCombinations: 80,
      completedCombinations: 0,
      startTime: null,
      endTime: null,
      bestResult: null,
      averageQuality: null
    }
  ]);

  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const generateParameterCombinations = () => {
    const { temperature, top_p, max_tokens } = batchConfig.parameterRanges;
    
    const combinations = [];
    for (let temp = temperature.min; temp <= temperature.max; temp += temperature.step) {
      for (let topP = top_p.min; topP <= top_p.max; topP += top_p.step) {
        for (let tokens = max_tokens.min; tokens <= max_tokens.max; tokens += max_tokens.step) {
          combinations.push({
            temperature: Math.round(temp * 10) / 10,
            top_p: Math.round(topP * 10) / 10,
            max_tokens: tokens
          });
        }
      }
    }
    return combinations;
  };

  const estimatedCombinations = generateParameterCombinations().length * batchConfig.iterations;
  const estimatedTime = Math.ceil(estimatedCombinations * 2.5); // 2.5 seconds per combination

  const createBatch = () => {
    if (!batchConfig.name || !batchConfig.prompt) return;
    
    setIsCreatingBatch(true);
    
    const newBatch = {
      id: Date.now(),
      name: batchConfig.name,
      status: 'queued',
      progress: 0,
      totalCombinations: estimatedCombinations,
      completedCombinations: 0,
      startTime: null,
      endTime: null,
      bestResult: null,
      averageQuality: null
    };

    setBatchJobs(prev => [newBatch, ...prev]);
    
    // Reset form
    setBatchConfig({
      name: '',
      description: '',
      prompt: '',
      model: 'gpt-4',
      parameterRanges: {
        temperature: { min: 0.1, max: 1.0, step: 0.1 },
        top_p: { min: 0.7, max: 1.0, step: 0.1 },
        max_tokens: { min: 500, max: 2000, step: 250 }
      },
      iterations: 3
    });
    
    setIsCreatingBatch(false);
  };

  const startBatch = (id) => {
    setBatchJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, status: 'running', startTime: new Date() }
        : job
    ));
  };

  const pauseBatch = (id) => {
    setBatchJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status: 'paused' } : job
    ));
  };

  const stopBatch = (id) => {
    setBatchJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status: 'stopped' } : job
    ));
  };

  const deleteBatch = (id) => {
    setBatchJobs(prev => prev.filter(job => job.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      case 'paused': return 'text-amber-600 bg-amber-100';
      case 'stopped': return 'text-red-600 bg-red-100';
      case 'queued': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return ArrowPathIcon;
      case 'completed': return CheckCircleIcon;
      case 'paused': return PauseIcon;
      case 'stopped': return StopIcon;
      case 'queued': return ClockIcon;
      default: return InformationCircleIcon;
    }
  };

  const ParameterRangeInput = ({ label, paramKey, min, max, step }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            value={batchConfig.parameterRanges[paramKey].min}
            onChange={(e) => setBatchConfig(prev => ({
              ...prev,
              parameterRanges: {
                ...prev.parameterRanges,
                [paramKey]: { ...prev.parameterRanges[paramKey], min: parseFloat(e.target.value) }
              }
            }))}
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            value={batchConfig.parameterRanges[paramKey].max}
            onChange={(e) => setBatchConfig(prev => ({
              ...prev,
              parameterRanges: {
                ...prev.parameterRanges,
                [paramKey]: { ...prev.parameterRanges[paramKey], max: parseFloat(e.target.value) }
              }
            }))}
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Step</label>
          <input
            type="number"
            value={batchConfig.parameterRanges[paramKey].step}
            onChange={(e) => setBatchConfig(prev => ({
              ...prev,
              parameterRanges: {
                ...prev.parameterRanges,
                [paramKey]: { ...prev.parameterRanges[paramKey], step: parseFloat(e.target.value) }
              }
            }))}
            min={step}
            max={1}
            step={step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const BatchJobCard = ({ job }) => {
    const StatusIcon = getStatusIcon(job.status);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>{job.completedCombinations}/{job.totalCombinations} combinations</span>
              {job.averageQuality && (
                <span>Avg Quality: {job.averageQuality}%</span>
              )}
              {job.startTime && (
                <span>Started: {job.startTime.toLocaleTimeString()}</span>
              )}
            </div>

            {job.status === 'running' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {job.bestResult && (
              <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-emerald-800 mb-1">Best Result</div>
                <div className="text-sm text-emerald-700">
                  Quality: {job.bestResult.quality}% • 
                  Temp: {job.bestResult.temperature} • 
                  Top-p: {job.bestResult.top_p}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {job.status === 'queued' && (
              <button
                onClick={() => startBatch(job.id)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Start</span>
              </button>
            )}
            
            {job.status === 'running' && (
              <>
                <button
                  onClick={() => pauseBatch(job.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                >
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => stopBatch(job.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <StopIcon className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </>
            )}

            {job.status === 'paused' && (
              <button
                onClick={() => startBatch(job.id)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            {(job.status === 'completed' || job.status === 'stopped') && (
              <button
                onClick={() => setSelectedJob(job)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View Results</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {job.status === 'completed' && (
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            )}
            
            <button
              onClick={() => deleteBatch(job.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Experiments</h1>
          <p className="text-gray-600 mt-2">Run multiple parameter combinations simultaneously with intelligent optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Active Jobs</div>
            <div className="text-2xl font-bold text-blue-600">
              {batchJobs.filter(job => job.status === 'running').length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Batch Configuration */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Batch</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                <input
                  type="text"
                  value={batchConfig.name}
                  onChange={(e) => setBatchConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Creative Writing Optimization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={batchConfig.description}
                  onChange={(e) => setBatchConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this batch experiment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Prompt</label>
                <textarea
                  value={batchConfig.prompt}
                  onChange={(e) => setBatchConfig(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter the prompt to test with different parameters..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={batchConfig.model}
                  onChange={(e) => setBatchConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude-3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Iterations per Combination</label>
                <input
                  type="number"
                  value={batchConfig.iterations}
                  onChange={(e) => setBatchConfig(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
                  min={1}
                  max={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Parameter Ranges */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parameter Ranges</h3>
            <div className="space-y-4">
              <ParameterRangeInput
                label="Temperature"
                paramKey="temperature"
                min={0}
                max={2}
                step={0.1}
              />
              <ParameterRangeInput
                label="Top-p"
                paramKey="top_p"
                min={0}
                max={1}
                step={0.1}
              />
              <ParameterRangeInput
                label="Max Tokens"
                paramKey="max_tokens"
                min={100}
                max={4000}
                step={100}
              />
            </div>
          </div>

          {/* Estimation */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Estimation</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Total Combinations:</span>
                <span className="font-semibold text-blue-900">{estimatedCombinations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Estimated Time:</span>
                <span className="font-semibold text-blue-900">{Math.floor(estimatedTime / 60)}m {estimatedTime % 60}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Estimated Cost:</span>
                <span className="font-semibold text-blue-900">~${(estimatedCombinations * 0.003).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={createBatch}
            disabled={!batchConfig.name || !batchConfig.prompt || isCreatingBatch}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SquaresPlusIcon className="w-5 h-5" />
            <span>{isCreatingBatch ? 'Creating...' : 'Create Batch'}</span>
          </button>
        </div>

        {/* Right Column - Batch Jobs */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Batch Jobs</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{batchJobs.length} total jobs</span>
            </div>
          </div>

          {batchJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <SquaresPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batch jobs yet</h3>
              <p className="text-gray-600">Create your first batch experiment to get started with parameter optimization.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batchJobs.map((job) => (
                <BatchJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchExperiments;
