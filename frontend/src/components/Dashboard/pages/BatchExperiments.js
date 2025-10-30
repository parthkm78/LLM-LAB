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
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  TrophyIcon,
  BeakerIcon,
  CpuChipIcon,
  BoltIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { designTokens, getParameterColor, getQualityColor } from '../../../styles/designTokens';

// Helper functions to generate mock data
const generateMockResults = (count) => {
  const results = [];
  for (let i = 0; i < count; i++) {
    const temperature = Math.round((0.1 + Math.random() * 0.9) * 10) / 10;
    const top_p = Math.round((0.7 + Math.random() * 0.3) * 10) / 10;
    const max_tokens = 500 + Math.floor(Math.random() * 4) * 250;
    
    results.push({
      id: i + 1,
      temperature,
      top_p,
      max_tokens,
      overall_quality: Math.round(60 + Math.random() * 40),
      coherence: Math.round(55 + Math.random() * 45),
      creativity: Math.round(50 + Math.random() * 50),
      readability: Math.round(65 + Math.random() * 35),
      completeness: Math.round(60 + Math.random() * 40),
      response_time: Math.round((1.5 + Math.random() * 3.5) * 100) / 100,
      cost: Math.round((0.001 + Math.random() * 0.008) * 10000) / 10000,
      content: `Generated response ${i + 1} with temperature=${temperature}, top_p=${top_p}`,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60)
    });
  }
  return results.sort((a, b) => b.overall_quality - a.overall_quality);
};

const generateQualityTrends = () => {
  const trends = [];
  for (let i = 0; i < 20; i++) {
    trends.push({
      combination: i + 1,
      overall_quality: Math.round(65 + Math.random() * 30),
      coherence: Math.round(60 + Math.random() * 35),
      creativity: Math.round(55 + Math.random() * 40),
      readability: Math.round(70 + Math.random() * 25),
      completeness: Math.round(65 + Math.random() * 30)
    });
  }
  return trends;
};

const generateParameterAnalysis = () => ({
  temperature: {
    optimal: 0.8,
    range: [0.1, 1.0],
    correlation: 0.75,
    insight: 'Higher temperature significantly improves creativity while maintaining coherence'
  },
  top_p: {
    optimal: 0.9,
    range: [0.7, 1.0],
    correlation: 0.45,
    insight: 'Values above 0.85 show diminishing returns on overall quality'
  },
  max_tokens: {
    optimal: 1500,
    range: [500, 2000],
    correlation: 0.32,
    insight: 'Sweet spot between 1000-1500 tokens for balanced completeness and conciseness'
  }
});

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
      name: 'Response Quality  Analysis',
      description: 'Testing optimal parameters for creative content generation across multiple temperature and top_p values',
      status: 'completed',
      progress: 100,
      totalCombinations: 120,
      completedCombinations: 120,
      startTime: new Date(Date.now() - 1000 * 60 * 45),
      endTime: new Date(Date.now() - 1000 * 60 * 5),
      bestResult: { 
        quality: 94, 
        temperature: 0.8, 
        top_p: 0.9,
        coherence: 92,
        creativity: 96,
        readability: 89,
        completeness: 91
      },
      averageQuality: 87.5,
      prompt: 'Write a creative short story about artificial intelligence discovering emotions for the first time. The story should be engaging, original, and thought-provoking.',
      model: 'gpt-4',
      parameterRanges: {
        temperature: { min: 0.1, max: 1.0, step: 0.1 },
        top_p: { min: 0.7, max: 1.0, step: 0.1 },
        max_tokens: { min: 500, max: 2000, step: 250 }
      },
      results: generateMockResults(120),
      qualityTrends: generateQualityTrends(),
      parameterAnalysis: generateParameterAnalysis(),
      insights: [
        'Higher temperature (0.8-0.9) significantly improves creativity scores',
        'Top_p values above 0.85 show diminishing returns on quality',
        'Sweet spot identified: temperature=0.8, top_p=0.9 for Response Quality ',
        'Max tokens between 1000-1500 provide optimal completeness'
      ]
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
    <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-white/30 p-4">
      <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">Min</label>
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
            className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">Max</label>
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
            className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">Step</label>
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
            className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );

  const BatchJobCard = ({ job }) => {
    const StatusIcon = getStatusIcon(job.status);
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{job.name}</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${getStatusColor(job.status)}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="font-medium">{job.completedCombinations}/{job.totalCombinations} combinations</span>
              {job.averageQuality && (
                <span className="font-medium">Avg Quality: <span className="font-bold text-emerald-600">{job.averageQuality}%</span></span>
              )}
              {job.startTime && (
                <span className="font-medium">Started: {job.startTime.toLocaleTimeString()}</span>
              )}
            </div>

            {job.status === 'running' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="font-bold">Progress</span>
                  <span className="font-black text-blue-600">{job.progress}%</span>
                </div>
                <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-lg" 
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {job.bestResult && (
              <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 p-3 mb-4 shadow-sm">
                <div className="text-sm font-bold text-emerald-800 mb-1">Best Result</div>
                <div className="text-sm text-emerald-700 font-medium">
                  Quality: <span className="font-black">{job.bestResult.quality}%</span> • 
                  Temp: <span className="font-bold">{job.bestResult.temperature}</span> • 
                  Top-p: <span className="font-bold">{job.bestResult.top_p}</span>
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
                className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Start</span>
              </button>
            )}
            
            {job.status === 'running' && (
              <>
                <button
                  onClick={() => pauseBatch(job.id)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={() => stopBatch(job.id)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <StopIcon className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </>
            )}

            {job.status === 'paused' && (
              <button
                onClick={() => startBatch(job.id)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            {(job.status === 'completed' || job.status === 'stopped') && (
              <button
                onClick={() => setSelectedJob(job)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View Results</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {job.status === 'completed' && (
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md transform hover:scale-105">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            )}
            
            <button
              onClick={() => deleteBatch(job.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 backdrop-blur-sm border border-red-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Comprehensive Batch Results Analysis View
  const BatchResultsAnalysisView = ({ job }) => {
    const [analysisTab, setAnalysisTab] = useState('overview'); // 'overview', 'quality-analysis', 'parameter-optimization', 'detailed-results'
    
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 transition-all duration-300 mb-4"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span className="text-sm">Back to Batch Jobs</span>
                </button>
                <h1 className="text-4xl font-bold mb-2">{job.name} - Results Analysis</h1>
                <p className="text-blue-100 text-lg mb-4">
                  Comprehensive analysis of {job.completedCombinations} parameter combinations
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Completed on {job.endTime?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-blue-300" />
                    <span>Duration: {Math.round((job.endTime - job.startTime) / (1000 * 60))} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    <span>Best Quality: {job.bestResult.quality}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 lg:mt-0">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Export Full Report</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 backdrop-blur-sm border border-emerald-400/30 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300">
                  <BoltIcon className="w-5 h-5" />
                  <span>Apply Best Config</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview & Summary', icon: ChartPieIcon },
                { id: 'quality-analysis', label: 'Quality Analysis', icon: TrophyIcon },
                { id: 'parameter-optimization', label: 'Parameter Optimization', icon: AdjustmentsHorizontalIcon },
                { id: 'detailed-results', label: 'Detailed Results', icon: DocumentTextIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAnalysisTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-300 ${
                    analysisTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {analysisTab === 'overview' && <OverviewAnalysis job={job} />}
          {analysisTab === 'quality-analysis' && <QualityAnalysis job={job} />}
          {analysisTab === 'parameter-optimization' && <ParameterOptimization job={job} />}
          {analysisTab === 'detailed-results' && <DetailedResults job={job} />}
        </div>
      </div>
    );
  };

  // Overview Analysis Component
  const OverviewAnalysis = ({ job }) => (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-emerald-600 text-sm font-medium">Best Result</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-1">{job.bestResult.quality}%</div>
          <div className="text-emerald-700 text-sm">Quality Score</div>
          <div className="text-xs text-gray-500 mt-2">
            Temp: {job.bestResult.temperature}, Top-p: {job.bestResult.top_p}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-600 text-sm font-medium">Average</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{job.averageQuality}%</div>
          <div className="text-blue-700 text-sm">Quality Score</div>
          <div className="text-xs text-gray-500 mt-2">
            Across all {job.completedCombinations} tests
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <SquaresPlusIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-600 text-sm font-medium">Coverage</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">{job.completedCombinations}</div>
          <div className="text-purple-700 text-sm">Combinations</div>
          <div className="text-xs text-gray-500 mt-2">
            100% completion rate
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-amber-600 text-sm font-medium">Efficiency</span>
          </div>
          <div className="text-3xl font-bold text-amber-600 mb-1">
            {Math.round((job.endTime - job.startTime) / (1000 * 60))}m
          </div>
          <div className="text-amber-700 text-sm">Total Duration</div>
          <div className="text-xs text-gray-500 mt-2">
            {Math.round((job.endTime - job.startTime) / (1000 * job.completedCombinations))}s per test
          </div>
        </div>
      </div>

      {/* Quality Trends Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quality Trends Across Parameter Combinations</h3>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <LineChart data={job.qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="combination" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall_quality" stroke="#3B82F6" strokeWidth={3} name="Overall Quality" />
              <Line type="monotone" dataKey="coherence" stroke="#10B981" strokeWidth={2} name="Coherence" />
              <Line type="monotone" dataKey="creativity" stroke="#8B5CF6" strokeWidth={2} name="Creativity" />
              <Line type="monotone" dataKey="readability" stroke="#F59E0B" strokeWidth={2} name="Readability" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {job.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Quality Analysis Component
  const QualityAnalysis = ({ job }) => (
    <div className="space-y-8">
      {/* Quality Metrics Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quality Metrics Breakdown</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Best Result Quality Profile</h4>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <RadarChart data={[
                  {
                    metric: 'Coherence',
                    value: job.bestResult.coherence,
                    fullMark: 100
                  },
                  {
                    metric: 'Creativity',
                    value: job.bestResult.creativity,
                    fullMark: 100
                  },
                  {
                    metric: 'Readability',
                    value: job.bestResult.readability,
                    fullMark: 100
                  },
                  {
                    metric: 'Completeness',
                    value: job.bestResult.completeness,
                    fullMark: 100
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Best Result"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Distribution */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quality Score Distribution</h4>
            <div className="space-y-4">
              {[
                { label: 'Coherence', value: job.bestResult.coherence, color: 'emerald' },
                { label: 'Creativity', value: job.bestResult.creativity, color: 'purple' },
                { label: 'Readability', value: job.bestResult.readability, color: 'blue' },
                { label: 'Completeness', value: job.bestResult.completeness, color: 'amber' }
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className={`text-lg font-bold text-${metric.color}-600`}>{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-${metric.color}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Results */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Top 10 Performing Configurations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-900">Rank</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Temperature</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Top-p</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Max Tokens</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Quality</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Coherence</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Creativity</th>
              </tr>
            </thead>
            <tbody>
              {job.results?.slice(0, 10).map((result, index) => (
                <tr key={result.id} className={`border-b border-gray-100 ${index === 0 ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {index === 0 && <TrophyIcon className="w-4 h-4 text-yellow-500" />}
                      <span className="font-bold text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{result.temperature}</td>
                  <td className="py-3 px-4 text-gray-700">{result.top_p}</td>
                  <td className="py-3 px-4 text-gray-700">{result.max_tokens}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${getQualityColor(result.overall_quality)}`}>
                      {result.overall_quality}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{result.coherence}%</td>
                  <td className="py-3 px-4 text-gray-700">{result.creativity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Parameter Optimization Component
  const ParameterOptimization = ({ job }) => (
    <div className="space-y-8">
      {/* Parameter Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(job.parameterAnalysis).map(([param, analysis]) => (
          <div key={param} className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 capitalize">{param.replace('_', ' ')}</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Optimal Value</div>
                <div className="text-2xl font-bold text-blue-600">{analysis.optimal}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Correlation with Quality</div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.abs(analysis.correlation) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{(analysis.correlation * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">{analysis.insight}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Parameter Correlation Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Parameter Impact on Quality Metrics</h3>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <BarChart data={[
              { parameter: 'Temperature', coherence: 75, creativity: 95, readability: 65, completeness: 70 },
              { parameter: 'Top-p', coherence: 45, creativity: 60, readability: 50, completeness: 40 },
              { parameter: 'Max Tokens', coherence: 30, creativity: 25, readability: 40, completeness: 80 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="parameter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="coherence" stackId="a" fill="#10B981" />
              <Bar dataKey="creativity" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="readability" stackId="a" fill="#3B82F6" />
              <Bar dataKey="completeness" stackId="a" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Detailed Results Component
  const DetailedResults = ({ job }) => (
    <div className="space-y-8">
      {/* Export Options */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Export Options</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Export as JSON</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <ChartBarIcon className="w-4 h-4" />
            <span>Export Analysis Report</span>
          </button>
        </div>
      </div>

      {/* All Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Results ({job.results?.length} configurations)</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Temperature</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Top-p</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Max Tokens</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Quality</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Coherence</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Creativity</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Time</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Cost</th>
              </tr>
            </thead>
            <tbody>
              {job.results?.map((result, index) => (
                <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{result.id}</td>
                  <td className="py-3 px-4 text-gray-700">{result.temperature}</td>
                  <td className="py-3 px-4 text-gray-700">{result.top_p}</td>
                  <td className="py-3 px-4 text-gray-700">{result.max_tokens}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${getQualityColor(result.overall_quality)}`}>
                      {result.overall_quality}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{result.coherence}%</td>
                  <td className="py-3 px-4 text-gray-700">{result.creativity}%</td>
                  <td className="py-3 px-4 text-gray-700">{result.response_time}s</td>
                  <td className="py-3 px-4 text-gray-700">${result.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {selectedJob ? (
        <BatchResultsAnalysisView job={selectedJob} />
      ) : (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
        <div className="px-6 py-5">
          <div className="max-w-7xl mx-auto">
            {/* Compact Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <div className="mb-4 md:mb-0">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-2">
                  <SquaresPlusIcon className="w-3 h-3 mr-1" />
                  Parameter Testing Lab
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  Batch Experiments
                </h1>
                <p className="text-white/80 text-sm">
                  Run multiple parameter combinations with intelligent optimization
                </p>
              </div>
              
              {/* Quick Actions in Header */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => createBatch()}
                  disabled={!batchConfig.name || !batchConfig.prompt || isCreatingBatch}
                  className="group bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 hover:bg-white/25 transition-all duration-300 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-1.5">
                    <SquaresPlusIcon className="w-4 h-4" />
                    <span>{isCreatingBatch ? 'Creating...' : 'Create Batch'}</span>
                  </div>
                </button>
                <button className="group bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 hover:bg-white/25 transition-all duration-300 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                  <div className="flex items-center space-x-1.5">
                    <ChartBarIcon className="w-4 h-4" />
                    <span>View Analytics</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Compact Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{batchJobs.length}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Total Batches</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{batchJobs.filter(job => job.status === 'running').length}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Active Jobs</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{estimatedCombinations}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Combinations</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">~${(estimatedCombinations * 0.003).toFixed(2)}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Est. Cost</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Redesigned Create New Batch Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SquaresPlusIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create New Batch Job</h2>
                  <p className="text-xs text-gray-600 font-medium">Configure parameters and launch batch experiments</p>
                </div>
              </div>
              <button
                onClick={createBatch}
                disabled={!batchConfig.name || !batchConfig.prompt || isCreatingBatch}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <SquaresPlusIcon className="w-4 h-4" />
                <span className="font-bold text-sm">{isCreatingBatch ? 'Creating...' : 'Create Batch'}</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Basic Configuration Section */}
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-4 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Basic Configuration</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Batch Name</label>
                      <input
                        type="text"
                        value={batchConfig.name}
                        onChange={(e) => setBatchConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Response Quality  Analysis"
                        className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white/90 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Model Selection</label>
                      <select
                        value={batchConfig.model}
                        onChange={(e) => setBatchConfig(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white/90 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      >
                        <option value="gpt-4">🤖 GPT-4</option>
                        <option value="gpt-3.5-turbo">⚡ GPT-3.5 Turbo</option>
                        <option value="claude-3">🧠 Claude-3</option>
                        <option value="gemini-pro">💎 Gemini Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Iterations per Combination</label>
                      <input
                        type="number"
                        value={batchConfig.iterations}
                        onChange={(e) => setBatchConfig(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
                        min={1}
                        max={10}
                        className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white/90 backdrop-blur-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher iterations improve accuracy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Configuration Section */}
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl border border-purple-200/50 p-4 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wider">Prompt Configuration</h3>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Test Prompt</label>
                    <textarea
                      value={batchConfig.prompt}
                      onChange={(e) => setBatchConfig(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Enter the prompt to test with different parameters...

Example:
Write a creative story about a time traveler who discovers that changing the past has unexpected consequences."
                      rows={8}
                      className="w-full px-3 py-2.5 border border-purple-200 rounded-lg bg-white/90 backdrop-blur-sm text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">This prompt will be tested with all parameter combinations</p>
                  </div>
                </div>
              </div>

              {/* Parameters & Analysis Section */}
              <div className="lg:col-span-4">
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-indigo-200/50 p-4 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Parameters & Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Parameter Ranges */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 p-3">
                      <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Parameter Ranges</h4>
                      <div className="space-y-3">
                        
                        {/* Temperature */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1 font-medium">Temperature (Creativity)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.temperature.min}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    temperature: { ...prev.parameterRanges.temperature, min: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Min"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Min</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.temperature.max}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    temperature: { ...prev.parameterRanges.temperature, max: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Max"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Max</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.temperature.step}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    temperature: { ...prev.parameterRanges.temperature, step: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Step"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Step</span>
                            </div>
                          </div>
                        </div>

                        {/* Top-p */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1 font-medium">Top-p (Focus)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.top_p.min}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    top_p: { ...prev.parameterRanges.top_p, min: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Min"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Min</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.top_p.max}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    top_p: { ...prev.parameterRanges.top_p, max: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Max"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Max</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.top_p.step}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    top_p: { ...prev.parameterRanges.top_p, step: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={0.1}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Step"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Step</span>
                            </div>
                          </div>
                        </div>

                        {/* Max Tokens */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1 font-medium">Max Tokens (Length)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.max_tokens.min}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    max_tokens: { ...prev.parameterRanges.max_tokens, min: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={100}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Min"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Min</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.max_tokens.max}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    max_tokens: { ...prev.parameterRanges.max_tokens, max: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={100}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Max"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Max</span>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={batchConfig.parameterRanges.max_tokens.step}
                                onChange={(e) => setBatchConfig(prev => ({
                                  ...prev,
                                  parameterRanges: {
                                    ...prev.parameterRanges,
                                    max_tokens: { ...prev.parameterRanges.max_tokens, step: parseFloat(e.target.value) }
                                  }
                                }))}
                                step={100}
                                className="w-full px-2 py-1.5 text-xs border border-indigo-200 rounded bg-white/80 focus:ring-1 focus:ring-indigo-400"
                                placeholder="Step"
                              />
                              <span className="text-xs text-gray-400 block mt-0.5">Step</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Estimation */}
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-lg border border-emerald-200/50 p-3">
                      <h4 className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        Live Estimation
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600 font-medium">Combinations:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{estimatedCombinations}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600 font-medium">Est. Time:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{Math.floor(estimatedTime / 60)}m {estimatedTime % 60}s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600 font-medium">Est. Cost:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">~${(estimatedCombinations * 0.003).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List with Pagination */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Batch Jobs</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 font-medium">
                {batchJobs.length} total jobs
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Show:</span>
                <select className="px-2 py-1 text-xs border border-purple-200 rounded bg-white/80 backdrop-blur-sm">
                  <option value="6">6 per page</option>
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                </select>
              </div>
            </div>
          </div>

          {batchJobs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-12 text-center">
              <SquaresPlusIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">No batch jobs yet</h3>
              <p className="text-gray-600 font-medium">Create your first batch experiment to get started with parameter optimization.</p>
            </div>
          ) : (
            <>
              {/* Jobs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {batchJobs.map((job) => (
                  <BatchJobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">1</button>
                    <button className="w-8 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
                    <button className="w-8 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
                    <span className="text-gray-400 px-1">...</span>
                    <button className="w-8 h-8 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">8</button>
                  </div>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    Next
                  </button>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Showing 1-6 of {batchJobs.length} jobs
                </div>
              </div>
            </>
          )}
        </div>
      </div>
        </div>
      )}
    </>
  );
};

export default BatchExperiments;
