import React, { useState } from 'react';
import { 
  SquaresPlusIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor, getParameterColor } from '../../../styles/designTokens';

const BatchResultsAnalysis = ({ batchId, onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('quality');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'chart', 'heatmap'

  // Mock comprehensive batch results data
  const batchData = {
    id: batchId || 'batch_001',
    name: 'Creative Writing Parameter Optimization',
    prompt: 'Write a compelling short story about artificial intelligence discovering emotions for the first time.',
    model: 'GPT-4',
    status: 'completed',
    totalCombinations: 120,
    completedCombinations: 120,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    endTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    duration: '1h 30m',
    totalCost: 0.542,
    averageQuality: 86.7,
    bestResult: {
      temperature: 0.8,
      top_p: 0.9,
      max_tokens: 400,
      quality: 94.2,
      creativity: 97,
      coherence: 92
    },
    parameterRanges: {
      temperature: { min: 0.1, max: 1.0, step: 0.1 },
      top_p: { min: 0.7, max: 1.0, step: 0.1 },
      max_tokens: { min: 300, max: 500, step: 50 }
    },
    insights: {
      optimalTemperature: { value: 0.8, confidence: 92 },
      optimalTopP: { value: 0.9, confidence: 88 },
      qualityTrend: 'increasing',
      costEfficiency: 'good',
      recommendations: [
        'Temperature range 0.7-0.9 consistently produces highest quality results',
        'Top-p values above 0.85 improve creativity without sacrificing coherence',
        'Max tokens above 400 show diminishing returns for quality improvement',
        'Consider using temperature 0.8 and top-p 0.9 for optimal balance'
      ]
    }
  };

  // Generate mock results grid
  const generateResults = () => {
    const results = [];
    const { temperature, top_p, max_tokens } = batchData.parameterRanges;
    
    for (let temp = temperature.min; temp <= temperature.max; temp += temperature.step) {
      for (let topP = top_p.min; topP <= top_p.max; topP += top_p.step) {
        for (let tokens = max_tokens.min; tokens <= max_tokens.max; tokens += max_tokens.step) {
          // Simulate quality based on parameter combinations
          const creativityBoost = (temp - 0.5) * 10;
          const coherencePenalty = temp > 0.8 ? (temp - 0.8) * 15 : 0;
          const topPBoost = topP > 0.85 ? 5 : 0;
          const baseQuality = 75 + Math.random() * 10;
          
          const quality = Math.min(95, Math.max(60, 
            baseQuality + creativityBoost - coherencePenalty + topPBoost
          ));

          results.push({
            id: `${temp}-${topP}-${tokens}`,
            temperature: Math.round(temp * 10) / 10,
            top_p: Math.round(topP * 10) / 10,
            max_tokens: tokens,
            quality: Math.round(quality * 10) / 10,
            creativity: Math.min(95, quality + (temp - 0.5) * 8),
            coherence: Math.max(70, quality - (temp > 0.7 ? (temp - 0.7) * 10 : 0)),
            readability: Math.max(75, quality + Math.random() * 10 - 5),
            cost: 0.003 + (tokens / 1000) * 0.002,
            responseTime: 1.5 + Math.random() * 2,
            tokenCount: tokens * 0.8 + Math.random() * tokens * 0.4
          });
        }
      }
    }
    
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'quality': return b.quality - a.quality;
        case 'creativity': return b.creativity - a.creativity;
        case 'coherence': return b.coherence - a.coherence;
        case 'cost': return a.cost - b.cost;
        case 'temperature': return b.temperature - a.temperature;
        default: return b.quality - a.quality;
      }
    });
  };

  const [results] = useState(generateResults());

  const filteredResults = results.filter(result => {
    switch (selectedFilter) {
      case 'top10': return result.quality >= 90;
      case 'high_creativity': return result.creativity >= 88;
      case 'balanced': return Math.abs(result.quality - result.creativity) <= 5;
      case 'cost_efficient': return result.cost <= 0.004;
      default: return true;
    }
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          {trend > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
  );

  const ResultCard = ({ result, rank }) => (
    <div className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
      rank <= 3 ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : 'border-gray-200 hover:border-blue-300'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {rank <= 3 && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
              }`}>
                <span className="text-white font-bold text-sm">#{rank}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                Combination {result.id}
              </h3>
              <div className="text-sm text-gray-600">
                T:{result.temperature} • P:{result.top_p} • Tokens:{result.max_tokens}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: getQualityColor(result.quality) }}>
              {result.quality}%
            </div>
            <div className="text-xs text-gray-500">Quality</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: getQualityColor(result.creativity) }}>
              {Math.round(result.creativity)}%
            </div>
            <div className="text-xs text-gray-500">Creativity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: getQualityColor(result.coherence) }}>
              {Math.round(result.coherence)}%
            </div>
            <div className="text-xs text-gray-500">Coherence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              ${result.cost.toFixed(4)}
            </div>
            <div className="text-xs text-gray-500">Cost</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span>Quality</span>
            <span>{result.quality}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full" 
              style={{ 
                width: `${result.quality}%`,
                backgroundColor: getQualityColor(result.quality)
              }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
            <EyeIcon className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <DocumentTextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ParameterHeatmap = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Parameter Performance Heatmap</h3>
      <div className="space-y-6">
        {/* Temperature vs Quality */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Temperature Impact on Quality</h4>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => {
              const temp = 0.1 + i * 0.1;
              const avgQuality = results
                .filter(r => Math.abs(r.temperature - temp) < 0.05)
                .reduce((sum, r, _, arr) => sum + r.quality / arr.length, 0);
              
              return (
                <div key={i} className="text-center">
                  <div 
                    className="w-full h-8 rounded mb-1"
                    style={{ backgroundColor: getQualityColor(avgQuality || 0) }}
                    title={`Temp: ${temp.toFixed(1)}, Avg Quality: ${avgQuality?.toFixed(1) || 0}%`}
                  ></div>
                  <div className="text-xs text-gray-600">{temp.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-p vs Creativity */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top-p Impact on Creativity</h4>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }, (_, i) => {
              const topP = 0.7 + i * 0.1;
              const avgCreativity = results
                .filter(r => Math.abs(r.top_p - topP) < 0.05)
                .reduce((sum, r, _, arr) => sum + r.creativity / arr.length, 0);
              
              return (
                <div key={i} className="text-center">
                  <div 
                    className="w-full h-8 rounded mb-1"
                    style={{ backgroundColor: getQualityColor(avgCreativity || 0) }}
                    title={`Top-p: ${topP.toFixed(1)}, Avg Creativity: ${avgCreativity?.toFixed(1) || 0}%`}
                  ></div>
                  <div className="text-xs text-gray-600">{topP.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Batch Experiments</span>
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{batchData.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Model: {batchData.model}</span>
                <span>•</span>
                <span>{batchData.completedCombinations} combinations</span>
                <span>•</span>
                <span>Duration: {batchData.duration}</span>
                <span>•</span>
                <span>Avg Quality: {batchData.averageQuality}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="grid">Grid View</option>
              <option value="chart">Chart View</option>
              <option value="heatmap">Heatmap View</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export Results</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Best Quality"
            value={`${batchData.bestResult.quality}%`}
            subtitle="Highest scoring combination"
            icon={TrophyIcon}
            trend={7.2}
            color="yellow"
          />
          <StatCard
            title="Average Quality"
            value={`${batchData.averageQuality}%`}
            subtitle="Across all combinations"
            icon={ChartBarIcon}
            trend={4.1}
            color="blue"
          />
          <StatCard
            title="Total Cost"
            value={`$${batchData.totalCost.toFixed(3)}`}
            subtitle="Complete batch experiment"
            icon={CpuChipIcon}
            color="purple"
          />
          <StatCard
            title="Combinations"
            value={batchData.completedCombinations}
            subtitle="Successfully completed"
            icon={SquaresPlusIcon}
            color="emerald"
          />
        </div>

        {/* Best Result Spotlight */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-8 border border-yellow-200">
          <div className="flex items-center space-x-3 mb-6">
            <TrophyIcon className="w-8 h-8 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Best Performing Combination</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Parameters</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-medium">{batchData.bestResult.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span>Top-p:</span>
                  <span className="font-medium">{batchData.bestResult.top_p}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Tokens:</span>
                  <span className="font-medium">{batchData.bestResult.max_tokens}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Quality Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Overall:</span>
                  <span className="font-medium text-emerald-600">{batchData.bestResult.quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Creativity:</span>
                  <span className="font-medium text-purple-600">{batchData.bestResult.creativity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Coherence:</span>
                  <span className="font-medium text-blue-600">{batchData.bestResult.coherence}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Insights</h3>
              <div className="text-sm text-yellow-800">
                <p className="mb-2">Optimal temperature for creative tasks</p>
                <p className="mb-2">High top-p maintains coherence</p>
                <p>Balanced creativity-quality ratio</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Recommendation</h3>
              <div className="text-sm text-yellow-800">
                <p className="mb-2">Use these parameters for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Creative writing</li>
                  <li>Storytelling</li>
                  <li>Narrative content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Results ({results.length})</option>
                <option value="top10">Top Quality (90%+)</option>
                <option value="high_creativity">High Creativity (88%+)</option>
                <option value="balanced">Balanced Performance</option>
                <option value="cost_efficient">Cost Efficient</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="quality">Sort by Quality</option>
              <option value="creativity">Sort by Creativity</option>
              <option value="coherence">Sort by Coherence</option>
              <option value="cost">Sort by Cost</option>
              <option value="temperature">Sort by Temperature</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredResults.length} of {results.length} results
          </div>
        </div>

        {/* Results Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.slice(0, 20).map((result, index) => (
              <ResultCard key={result.id} result={result} rank={index + 1} />
            ))}
          </div>
        )}

        {viewMode === 'heatmap' && <ParameterHeatmap />}

        {viewMode === 'chart' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Charts</h3>
            <div className="text-center py-12">
              <ChartPieIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive charts coming soon...</p>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Key Findings</h3>
              <div className="space-y-3">
                {batchData.insights.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-800 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Optimization Recommendations</h3>
              <div className="space-y-3">
                {batchData.insights.recommendations.slice(2).map((rec, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchResultsAnalysis;
