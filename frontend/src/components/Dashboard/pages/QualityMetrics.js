import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor, getQualityColorWithOpacity } from '../../../styles/designTokens';

const QualityMetrics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overall_quality');
  const [viewMode, setViewMode] = useState('overview');

  // Mock data for quality metrics
  const mockData = {
    overallStats: {
      totalResponses: 1247,
      averageQuality: 87.3,
      qualityTrend: 5.2,
      topPerformingModel: 'GPT-4',
      improvementSuggestions: 3
    },
    metricBreakdown: {
      coherence_score: { current: 89.2, trend: 2.1, samples: 1247 },
      completeness_score: { current: 85.7, trend: -0.8, samples: 1247 },
      readability_score: { current: 91.4, trend: 3.2, samples: 1247 },
      creativity_score: { current: 83.1, trend: 1.9, samples: 1247 }
    },
    recentAnalyses: [
      {
        id: 1,
        prompt: "Write a comprehensive guide on machine learning...",
        model: "GPT-4",
        parameters: { temperature: 0.7, top_p: 0.9 },
        metrics: {
          coherence_score: 92,
          completeness_score: 88,
          readability_score: 94,
          creativity_score: 76,
          overall_quality: 87.5
        },
        timestamp: "2024-10-29T10:30:00Z",
        responseLength: 1240,
        processingTime: 2.3
      },
      {
        id: 2,
        prompt: "Create a creative story about AI consciousness...",
        model: "Claude-3",
        parameters: { temperature: 0.9, top_p: 0.95 },
        metrics: {
          coherence_score: 85,
          completeness_score: 91,
          readability_score: 89,
          creativity_score: 95,
          overall_quality: 90.0
        },
        timestamp: "2024-10-29T10:15:00Z",
        responseLength: 980,
        processingTime: 1.8
      },
      {
        id: 3,
        prompt: "Explain quantum computing principles...",
        model: "GPT-4",
        parameters: { temperature: 0.3, top_p: 0.8 },
        metrics: {
          coherence_score: 95,
          completeness_score: 93,
          readability_score: 87,
          creativity_score: 65,
          overall_quality: 85.0
        },
        timestamp: "2024-10-29T09:45:00Z",
        responseLength: 1560,
        processingTime: 3.1
      }
    ],
    qualityDistribution: [
      { range: '90-100', count: 156, percentage: 12.5 },
      { range: '80-89', count: 498, percentage: 39.9 },
      { range: '70-79', count: 374, percentage: 30.0 },
      { range: '60-69', count: 156, percentage: 12.5 },
      { range: '50-59', count: 63, percentage: 5.1 }
    ]
  };

  const timeRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const metrics = [
    { value: 'overall_quality', label: 'Overall Quality', color: '#3b82f6' },
    { value: 'coherence_score', label: 'Coherence', color: '#10b981' },
    { value: 'completeness_score', label: 'Completeness', color: '#f59e0b' },
    { value: 'readability_score', label: 'Readability', color: '#8b5cf6' },
    { value: 'creativity_score', label: 'Creativity', color: '#ef4444' }
  ];

  const MetricCard = ({ title, current, trend, samples, description }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: getQualityColor(current) }}>
            {current}%
          </div>
          <div className="text-xs text-gray-500">{samples} samples</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {trend > 0 ? (
          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}% from last period
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${current}%`,
              backgroundColor: getQualityColor(current)
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const AnalysisRow = ({ analysis }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">
            {analysis.prompt.length > 60 ? `${analysis.prompt.substring(0, 60)}...` : analysis.prompt}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Model: {analysis.model}</span>
            <span>•</span>
            <span>Temp: {analysis.parameters.temperature}</span>
            <span>•</span>
            <span>{analysis.responseLength} chars</span>
            <span>•</span>
            <span>{analysis.processingTime}s</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: getQualityColor(analysis.metrics.overall_quality) }}>
            {analysis.metrics.overall_quality}%
          </div>
          <div className="text-xs text-gray-500">Overall Quality</div>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(analysis.metrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-lg font-bold" style={{ color: getQualityColor(value) }}>
              {value}%
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {key.replace('_score', '').replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {new Date(analysis.timestamp).toLocaleString()}
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
            <EyeIcon className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </div>
  );

  const QualityDistributionChart = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Score Distribution</h3>
      <div className="space-y-4">
        {mockData.qualityDistribution.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm font-medium text-gray-600">{item.range}%</div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{item.count} responses</span>
                <span className="font-medium text-gray-900">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" 
                  style={{ width: `${item.percentage * 2}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Metrics</h1>
          <p className="text-gray-600 mt-2">Comprehensive quality analysis with trends and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Responses</h3>
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{mockData.overallStats.totalResponses.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Analyzed responses</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Quality</h3>
            <ChartBarIcon className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{mockData.overallStats.averageQuality}%</div>
          <div className="flex items-center text-sm text-emerald-600 mt-1">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            +{mockData.overallStats.qualityTrend}% improvement
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Model</h3>
            <SparklesIcon className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{mockData.overallStats.topPerformingModel}</div>
          <div className="text-sm text-gray-600 mt-1">Best performer</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
            <InformationCircleIcon className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-600">{mockData.overallStats.improvementSuggestions}</div>
          <div className="text-sm text-gray-600 mt-1">New recommendations</div>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Metric Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Coherence"
            current={mockData.metricBreakdown.coherence_score.current}
            trend={mockData.metricBreakdown.coherence_score.trend}
            samples={mockData.metricBreakdown.coherence_score.samples}
            description="Logical flow and consistency"
          />
          <MetricCard
            title="Completeness"
            current={mockData.metricBreakdown.completeness_score.current}
            trend={mockData.metricBreakdown.completeness_score.trend}
            samples={mockData.metricBreakdown.completeness_score.samples}
            description="Comprehensive coverage of topic"
          />
          <MetricCard
            title="Readability"
            current={mockData.metricBreakdown.readability_score.current}
            trend={mockData.metricBreakdown.readability_score.trend}
            samples={mockData.metricBreakdown.readability_score.samples}
            description="Clarity and ease of understanding"
          />
          <MetricCard
            title="Creativity"
            current={mockData.metricBreakdown.creativity_score.current}
            trend={mockData.metricBreakdown.creativity_score.trend}
            samples={mockData.metricBreakdown.creativity_score.samples}
            description="Originality and innovative thinking"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quality Distribution */}
        <div className="lg:col-span-1">
          <QualityDistributionChart />
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <ChartPieIcon className="w-4 h-4" />
                <span>View Charts</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mockData.recentAnalyses.map((analysis) => (
              <AnalysisRow key={analysis.id} analysis={analysis} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Load More Analyses
            </button>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Insights</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-1">Parameter Optimization Opportunity</h4>
                <p className="text-purple-700 text-sm">
                  Increasing temperature to 0.8 for creative prompts could improve creativity scores by an estimated 12%.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-1">Model Performance Pattern</h4>
                <p className="text-blue-700 text-sm">
                  GPT-4 consistently outperforms other models on technical content with 15% higher coherence scores.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-1">Quality Improvement Trend</h4>
                <p className="text-emerald-700 text-sm">
                  Overall quality has improved 5.2% this week, primarily driven by better readability optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMetrics;
