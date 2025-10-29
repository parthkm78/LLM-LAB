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
  ChartPieIcon,
  CubeTransparentIcon,
  PresentationChartLineIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { designTokens, getQualityColor, getQualityColorWithOpacity } from '../../../styles/designTokens';

const QualityMetrics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overall_quality');
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'advanced'
  const [chartView, setChartView] = useState('trends'); // 'trends', 'distribution', 'correlation', 'advanced'

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
    // Advanced chart data
    qualityTrendData: [
      { date: '2024-10-22', coherence: 85, completeness: 82, readability: 88, creativity: 79, overall: 83.5 },
      { date: '2024-10-23', coherence: 87, completeness: 84, readability: 89, creativity: 81, overall: 85.2 },
      { date: '2024-10-24', coherence: 86, completeness: 83, readability: 91, creativity: 80, overall: 85.0 },
      { date: '2024-10-25', coherence: 88, completeness: 85, readability: 90, creativity: 82, overall: 86.2 },
      { date: '2024-10-26', coherence: 89, completeness: 86, readability: 92, creativity: 83, overall: 87.5 },
      { date: '2024-10-27', coherence: 90, completeness: 85, readability: 93, creativity: 84, overall: 88.0 },
      { date: '2024-10-28', coherence: 89, completeness: 86, readability: 91, creativity: 83, overall: 87.3 }
    ],
    modelPerformance: [
      { model: 'GPT-4', coherence: 92, completeness: 89, readability: 94, creativity: 85, count: 423 },
      { model: 'GPT-3.5', coherence: 86, completeness: 83, readability: 88, creativity: 81, count: 387 },
      { model: 'Claude-3', coherence: 89, completeness: 87, readability: 91, creativity: 83, count: 298 },
      { model: 'Gemini', coherence: 84, completeness: 81, readability: 86, creativity: 79, count: 139 }
    ],
    parameterCorrelation: [
      { temperature: 0.1, coherence: 92, creativity: 65, readability: 95 },
      { temperature: 0.3, coherence: 89, creativity: 72, readability: 92 },
      { temperature: 0.5, coherence: 87, creativity: 78, readability: 89 },
      { temperature: 0.7, coherence: 85, creativity: 84, readability: 86 },
      { temperature: 0.9, coherence: 82, creativity: 89, readability: 83 },
      { temperature: 1.0, coherence: 79, creativity: 92, readability: 80 }
    ],
    qualityDistribution: [
      { range: '90-100', count: 234, percentage: 18.8 },
      { range: '80-89', count: 512, percentage: 41.1 },
      { range: '70-79', count: 356, percentage: 28.5 },
      { range: '60-69', count: 145, percentage: 11.6 }
    ],
    radarData: [
      { metric: 'Coherence', current: 89.2, benchmark: 85, target: 92 },
      { metric: 'Completeness', current: 85.7, benchmark: 80, target: 88 },
      { metric: 'Readability', current: 91.4, benchmark: 88, target: 93 },
      { metric: 'Creativity', current: 83.1, benchmark: 78, target: 86 },
      { metric: 'Factual Accuracy', current: 87.3, benchmark: 84, target: 90 },
      { metric: 'Relevance', current: 88.9, benchmark: 86, target: 91 }
    ],
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

  // Advanced Chart Components
  const QualityTrendChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quality Trends Over Time</h3>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-lg text-sm font-medium text-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mockData.qualityTrendData}>
          <defs>
            <linearGradient id="coherenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="readabilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '12px',
              backdropFilter: 'blur(4px)'
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="coherence" stroke="#3B82F6" fillOpacity={1} fill="url(#coherenceGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="readability" stroke="#8B5CF6" fillOpacity={1} fill="url(#readabilityGradient)" strokeWidth={2} />
          <Area type="monotone" dataKey="creativity" stroke="#F59E0B" fill="none" strokeWidth={2} />
          <Area type="monotone" dataKey="completeness" stroke="#10B981" fill="none" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const ModelPerformanceChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Model Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={mockData.modelPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="model" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '12px',
              backdropFilter: 'blur(4px)'
            }}
          />
          <Legend />
          <Bar dataKey="coherence" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completeness" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="readability" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="creativity" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const ParameterCorrelationChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Parameter vs Quality Correlation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={mockData.parameterCorrelation}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="temperature" 
            stroke="#6B7280" 
            fontSize={12}
            name="Temperature"
            domain={[0, 1]}
          />
          <YAxis stroke="#6B7280" fontSize={12} name="Score" domain={[60, 100]} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #E5E7EB', 
              borderRadius: '12px',
              backdropFilter: 'blur(4px)'
            }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter dataKey="coherence" fill="#3B82F6" name="Coherence" />
          <Scatter dataKey="creativity" fill="#F59E0B" name="Creativity" />
          <Scatter dataKey="readability" fill="#10B981" name="Readability" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );

  const QualityRadarChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Quality Metrics Radar</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={mockData.radarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="metric" stroke="#6B7280" fontSize={12} />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            angle={90} 
            tickCount={6}
            stroke="#6B7280"
            fontSize={10}
          />
          <Radar 
            name="Current" 
            dataKey="current" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar 
            name="Target" 
            dataKey="target" 
            stroke="#8B5CF6" 
            fill="#8B5CF6" 
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar 
            name="Benchmark" 
            dataKey="benchmark" 
            stroke="#6B7280" 
            fill="none" 
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 font-medium">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color: getQualityColor(current) }}>
            {current}%
          </div>
          <div className="text-xs text-gray-500 font-medium">{samples} samples</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {trend > 0 ? (
          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-bold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}% from last period
        </span>
      </div>
      
      {/* Enhanced Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden">
          <div 
            className="h-3 rounded-full transition-all duration-500 shadow-lg" 
            style={{ 
              width: `${current}%`,
              background: `linear-gradient(90deg, ${getQualityColor(current)}, ${getQualityColor(current)}dd)`
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const AnalysisRow = ({ analysis }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {analysis.prompt.length > 60 ? `${analysis.prompt.substring(0, 60)}...` : analysis.prompt}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-medium">Model: <span className="font-bold text-blue-600">{analysis.model}</span></span>
            <span>•</span>
            <span className="font-medium">Temp: <span className="font-bold">{analysis.parameters.temperature}</span></span>
            <span>•</span>
            <span className="font-medium">{analysis.responseLength} chars</span>
            <span>•</span>
            <span className="font-medium">{analysis.processingTime}s</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: getQualityColor(analysis.metrics.overall_quality) }}>
            {analysis.metrics.overall_quality}%
          </div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Overall Quality</div>
        </div>
      </div>

      {/* Enhanced Metrics breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(analysis.metrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
          <div key={key} className="text-center bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-lg border border-white/30 p-3">
            <div className="text-lg font-black" style={{ color: getQualityColor(value) }}>
              {value}%
            </div>
            <div className="text-xs text-gray-600 capitalize font-bold uppercase tracking-wider">
              {key.replace('_score', '').replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 font-medium">
          {new Date(analysis.timestamp).toLocaleString()}
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105">
            <EyeIcon className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md transform hover:scale-105">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </div>
  );

  const QualityDistributionChart = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Quality Score Distribution</h3>
      <div className="space-y-4">
        {mockData.qualityDistribution.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm font-bold text-gray-600">{item.range}%</div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">{item.count} responses</span>
                <span className="font-black text-gray-900 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-0.5 rounded-full">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 shadow-lg" 
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
        <div className="px-6 py-5">
          <div className="max-w-7xl mx-auto">
            {/* Compact Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <div className="mb-4 md:mb-0">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-2">
                  <ChartBarIcon className="w-3 h-3 mr-1" />
                  Parameter Testing Lab
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  Quality Metrics
                </h1>
                <p className="text-white/80 text-sm">
                  Comprehensive quality analysis with trends and insights
                </p>
              </div>
              
              {/* Quick Actions in Header */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-white/25 transition-all duration-300"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value} className="text-gray-900">{range.label}</option>
                  ))}
                </select>
                <button className="group bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-2 hover:bg-white/25 transition-all duration-300 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                  <div className="flex items-center space-x-1.5">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export Report</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Compact Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{mockData.overallStats.totalResponses.toLocaleString()}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Total Responses</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{mockData.overallStats.averageQuality}%</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Avg Quality</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">{mockData.overallStats.topPerformingModel}</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Top Model</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-center">
                <div className="text-xl font-black text-white mb-0.5">+{mockData.overallStats.qualityTrend}%</div>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-purple-200/50 shadow-xl">
            {[
              { id: 'metrics', label: 'Metrics Breakdown', icon: ChartBarIcon },
              { id: 'advanced', label: 'Advanced Analysis', icon: PresentationChartLineIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-purple-700 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'metrics' && (
          <div className="p-6 space-y-6">

        {/* Compact Metric Breakdown */}
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Metric Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Quality Distribution */}
        <div>
          <QualityDistributionChart />
        </div>

            {/* Enhanced Insights Section */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">AI-Powered Insights</h3>
                  <div className="space-y-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/50 p-4 shadow-lg">
                      <h4 className="font-bold text-purple-900 mb-1">Parameter Optimization Opportunity</h4>
                      <p className="text-purple-700 text-sm font-medium">
                        Increasing temperature to 0.8 for creative prompts could improve creativity scores by an estimated 12%.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-4 shadow-lg">
                      <h4 className="font-bold text-blue-900 mb-1">Model Performance Pattern</h4>
                      <p className="text-blue-700 text-sm font-medium">
                        GPT-4 consistently outperforms other models on technical content with 15% higher coherence scores.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 p-4 shadow-lg">
                      <h4 className="font-bold text-emerald-900 mb-1">Quality Improvement Trend</h4>
                      <p className="text-emerald-700 text-sm font-medium">
                        Overall quality has improved 5.2% this week, primarily driven by better readability optimization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Recent Analyses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Analyses</h2>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md transform hover:scale-105">
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105">
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
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
              Load More Analyses
            </button>
          </div>
        </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Advanced Charts Section */}
            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm rounded-3xl border border-purple-200/30 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <PresentationChartLineIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Advanced Analytics</h2>
                    <p className="text-purple-600 font-medium">Comprehensive quality insights and trends</p>
                  </div>
                </div>
                
                {/* Chart Navigation */}
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-purple-200">
                  {[
                    { id: 'trends', label: 'Trends', icon: PresentationChartLineIcon },
                    { id: 'distribution', label: 'Distribution', icon: ChartPieIcon },
                    { id: 'correlation', label: 'Correlation', icon: CubeTransparentIcon },
                    { id: 'advanced', label: 'Advanced', icon: TableCellsIcon }
                  ].map((view) => {
                    const Icon = view.icon;
                    return (
                      <button
                        key={view.id}
                        onClick={() => setChartView(view.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                          chartView === view.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-purple-700 hover:bg-white/80 hover:shadow-md'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-bold">{view.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

          {/* Charts Grid */}
          {chartView === 'trends' && (
            <div className="space-y-8">
              <QualityTrendChart />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ModelPerformanceChart />
                <QualityRadarChart />
              </div>
            </div>
          )}

          {chartView === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Quality Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.qualityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockData.qualityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px',
                        backdropFilter: 'blur(4px)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Metric Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { metric: 'Coherence', excellent: 234, good: 512, fair: 356, poor: 145 },
                    { metric: 'Completeness', excellent: 189, good: 445, fair: 423, poor: 190 },
                    { metric: 'Readability', excellent: 267, good: 534, fair: 312, poor: 134 },
                    { metric: 'Creativity', excellent: 156, good: 423, fair: 456, poor: 212 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="metric" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="excellent" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="good" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="fair" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="poor" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartView === 'correlation' && (
            <div className="space-y-8">
              <ParameterCorrelationChart />
              
              {/* First Row - Matrix and Length Correlation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Metric Correlation Matrix</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-200 rounded"></div>
                        <span>Weak (0.2-0.4)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Moderate (0.4-0.7)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-800 rounded"></div>
                        <span>Strong (0.7+)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-blue-50/80 rounded-lg">
                    <p className="text-xs text-blue-800 font-medium">
                      📊 <strong>Data Source:</strong> Analysis of 1,247 responses across GPT-4, Claude, and Gemini models
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      📈 <strong>Calculation:</strong> Pearson correlation coefficient between quality metrics
                    </p>
                  </div>
                  <div className="mb-4">
                    <div className="grid grid-cols-5 gap-1 text-xs font-medium text-gray-600">
                      <div></div>
                      <div className="text-center">Coherence</div>
                      <div className="text-center">Complete</div>
                      <div className="text-center">Readable</div>
                      <div className="text-center">Creative</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {['Coherence', 'Completeness', 'Readability', 'Creativity'].map((metric1, i) => 
                      [metric1.slice(0, 8), ...['Coherence', 'Completeness', 'Readability', 'Creativity']].map((metric2, j) => {
                        if (j === 0) {
                          return (
                            <div key={`label-${i}`} className="text-xs font-medium text-gray-600 flex items-center">
                              {metric2}
                            </div>
                          );
                        }
                        const actualJ = j - 1;
                        const correlations = [
                          [1, 0.87, 0.76, 0.23],
                          [0.87, 1, 0.82, 0.31],
                          [0.76, 0.82, 1, 0.19],
                          [0.23, 0.31, 0.19, 1]
                        ];
                        const correlation = correlations[i][actualJ];
                        return (
                          <div 
                            key={`${i}-${actualJ}`} 
                            className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold text-white relative group cursor-pointer"
                            style={{ 
                              backgroundColor: `rgba(${59 + correlation * 80}, ${130 + correlation * 80}, 246, ${correlation})` 
                            }}
                          >
                            {correlation.toFixed(2)}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              {correlation > 0.7 ? 'Strong' : correlation > 0.4 ? 'Moderate' : 'Weak'} correlation
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    <strong>Key Insights:</strong> Strong correlation between Coherence-Readability (0.87) suggests these metrics improve together
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quality vs Response Length</h3>
                    <div className="text-xs text-gray-600 font-medium">
                      Sample: 8 responses
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-purple-50/80 rounded-lg">
                    <p className="text-xs text-purple-800 font-medium">
                      📏 <strong>X-axis:</strong> Response length in characters (50-1200)
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      ⭐ <strong>Y-axis:</strong> Aggregated quality score (0-100) from all metrics
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      🎯 <strong>Models:</strong> GPT-4, Claude, GPT-3.5, Gemini across various prompts
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart data={[
                      { length: 50, quality: 75, model: 'GPT-3.5' }, { length: 120, quality: 82, model: 'GPT-4' }, 
                      { length: 200, quality: 88, model: 'GPT-4' }, { length: 350, quality: 91, model: 'Claude' },
                      { length: 500, quality: 89, model: 'GPT-4' }, { length: 750, quality: 85, model: 'Claude' },
                      { length: 1000, quality: 82, model: 'GPT-3.5' }, { length: 1200, quality: 78, model: 'Gemini' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="length" stroke="#6B7280" fontSize={12} name="Response Length (chars)" />
                      <YAxis dataKey="quality" stroke="#6B7280" fontSize={12} name="Quality Score" domain={[70, 95]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB', 
                          borderRadius: '12px'
                        }}
                        formatter={(value, name) => [
                          name === 'quality' ? `${value} (Quality Score)` : value,
                          name === 'quality' ? 'Quality' : name
                        ]}
                        labelFormatter={(label) => `Length: ${label} characters`}
                        cursor={{ strokeDasharray: '3 3' }} 
                      />
                      <Scatter dataKey="quality" fill="#8B5CF6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Trend:</strong> Quality peaks around 350-500 characters, then decreases with very long responses
                  </div>
                </div>
              </div>

              {/* Second Row - Model Performance & Parameter Interaction */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Model Performance Correlation</h3>
                    <div className="text-xs text-gray-600 font-medium">
                      Avg. across 312 tests each
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-green-50/80 rounded-lg">
                    <p className="text-xs text-green-800 font-medium">
                      🤖 <strong>Models:</strong> GPT-4, Claude 3.5, GPT-3.5-Turbo, Gemini Pro
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      📊 <strong>Metrics:</strong> Normalized scores (0.0-1.0) for direct comparison
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      ⚙️ <strong>Parameters:</strong> Temperature 0.7, Top-p 0.9, Max tokens 1000
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { model: 'GPT-4', coherence: 0.85, creativity: 0.72, readability: 0.91, completeness: 0.88 },
                      { model: 'Claude', coherence: 0.81, creativity: 0.89, readability: 0.86, completeness: 0.84 },
                      { model: 'GPT-3.5', coherence: 0.76, creativity: 0.68, readability: 0.79, completeness: 0.73 },
                      { model: 'Gemini', coherence: 0.79, creativity: 0.75, readability: 0.82, completeness: 0.77 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="model" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} domain={[0.6, 1]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px' }}
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, '']}
                      />
                      <Legend />
                      <Bar dataKey="coherence" fill="#3B82F6" name="Coherence" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="creativity" fill="#F59E0B" name="Creativity" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="readability" fill="#10B981" name="Readability" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="completeness" fill="#8B5CF6" name="Completeness" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Best Performers:</strong> GPT-4 (Readability), Claude (Creativity), GPT-4 (Overall)
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Parameter Interaction Heatmap</h3>
                    <div className="text-xs text-gray-600 font-medium">
                      Cross-correlation
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-orange-50/80 rounded-lg">
                    <p className="text-xs text-orange-800 font-medium">
                      🔧 <strong>Parameters:</strong> Temperature (0.1-1.0), Top-p (0.1-1.0), Max Tokens (100-2000)
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      📈 <strong>Analysis:</strong> Correlation between parameter settings and output quality
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      📊 <strong>Scale:</strong> 1.0 = perfect correlation, 0.0 = no correlation
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600">
                      <div></div>
                      <div className="text-center">Temp</div>
                      <div className="text-center">Top-p</div>
                      <div className="text-center">Max Tokens</div>
                    </div>
                    {[
                      { param: 'Temperature', values: [1, 0.34, 0.67], description: 'Controls randomness' },
                      { param: 'Top-p', values: [0.34, 1, 0.52], description: 'Nucleus sampling' },
                      { param: 'Max Tokens', values: [0.67, 0.52, 1], description: 'Response length limit' }
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <div className="text-xs font-medium text-gray-600 flex items-center">
                          <div className="group relative">
                            {row.param}
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {row.description}
                            </div>
                          </div>
                        </div>
                        {row.values.map((value, j) => (
                          <div 
                            key={j} 
                            className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold text-white group relative"
                            style={{ 
                              backgroundColor: `rgba(139, 92, 246, ${value})` 
                            }}
                          >
                            {value.toFixed(2)}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              {value > 0.6 ? 'Strong' : value > 0.3 ? 'Moderate' : 'Weak'} interaction
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    <strong>Key Finding:</strong> Temperature and Max Tokens show strong correlation (0.67) - higher creativity needs longer responses
                  </div>
                </div>
              </div>

              {/* Third Row - Time Correlation & Statistical Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Time-based Correlation Analysis</h3>
                    <div className="text-xs text-gray-600 font-medium">
                      24-hour cycle
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-indigo-50/80 rounded-lg">
                    <p className="text-xs text-indigo-800 font-medium">
                      ⏰ <strong>Time Frame:</strong> Analysis across 6 time periods over 30 days
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      📊 <strong>Metric:</strong> Average correlation between user satisfaction and quality scores
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      👥 <strong>Sample:</strong> 2,847 user interactions across different time zones
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={[
                      { hour: '00:00', correlation: 0.72, sessions: 89 }, { hour: '04:00', correlation: 0.68, sessions: 34 },
                      { hour: '08:00', correlation: 0.84, sessions: 234 }, { hour: '12:00', correlation: 0.91, sessions: 456 },
                      { hour: '16:00', correlation: 0.88, sessions: 389 }, { hour: '20:00', correlation: 0.79, sessions: 267 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} domain={[0.6, 1]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px' }}
                        formatter={(value, name, props) => [
                          name === 'correlation' ? `${(value * 100).toFixed(1)}%` : value,
                          name === 'correlation' ? 'Quality Correlation' : name
                        ]}
                        labelFormatter={(label) => `Time: ${label} | Sessions: ${
                          [89, 34, 234, 456, 389, 267][['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].indexOf(label)]
                        }`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="correlation" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Peak Performance:</strong> 12:00 PM shows highest correlation (91%) - users most satisfied during lunch hours
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Statistical Correlation Summary</h3>
                    <div className="text-xs text-gray-600 font-medium">
                      Pearson r-values
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-gray-50/80 rounded-lg">
                    <p className="text-xs text-gray-800 font-medium">
                      📊 <strong>Statistical Method:</strong> Pearson correlation coefficient (r)
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      📈 <strong>Data Points:</strong> 1,247 analyzed responses with p-value &lt; 0.05
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      🎯 <strong>Significance:</strong> All correlations shown are statistically significant
                    </p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { metric1: 'Coherence', metric2: 'Readability', correlation: 0.87, strength: 'Strong', color: 'text-green-600', pValue: '&lt; 0.001' },
                      { metric1: 'Creativity', metric2: 'Temperature', correlation: 0.74, strength: 'Strong', color: 'text-green-600', pValue: '&lt; 0.001' },
                      { metric1: 'Completeness', metric2: 'Max Tokens', correlation: 0.62, strength: 'Moderate', color: 'text-blue-600', pValue: '&lt; 0.01' },
                      { metric1: 'Readability', metric2: 'Response Length', correlation: -0.43, strength: 'Weak', color: 'text-orange-600', pValue: '&lt; 0.05' },
                      { metric1: 'Quality', metric2: 'Processing Time', correlation: 0.51, strength: 'Moderate', color: 'text-blue-600', pValue: '&lt; 0.01' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {item.metric1} ↔ {item.metric2}
                          </div>
                          <div className={`text-xs font-bold ${item.color}`}>
                            {item.strength} ({item.correlation > 0 ? '+' : ''}{item.correlation}) | p {item.pValue}
                          </div>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              Math.abs(item.correlation) > 0.7 ? 'bg-green-500' : 
                              Math.abs(item.correlation) > 0.4 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    <strong>Methodology:</strong> All correlations calculated using Pearson's r with 95% confidence intervals
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartView === 'advanced' && (
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-xl p-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Multi-Metric Performance Over Time</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={mockData.qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="coherence" fill="#3B82F6" opacity={0.7} />
                    <Bar yAxisId="left" dataKey="readability" fill="#8B5CF6" opacity={0.7} />
                    <Line yAxisId="right" type="monotone" dataKey="overall" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Advanced Metrics Cards */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <SparklesIcon className="w-8 h-8 text-blue-600" />
                    <h4 className="font-bold text-blue-900">Quality Prediction</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Next Week Forecast</span>
                      <span className="font-bold text-green-600">+2.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                      <span className="font-bold text-blue-600">87%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-purple-200/50 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                    <h4 className="font-bold text-purple-900">Optimization Score</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Current Efficiency</span>
                      <span className="font-bold text-purple-600">92.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Potential Gain</span>
                      <span className="font-bold text-orange-600">+5.2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CubeTransparentIcon className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900">Anomaly Detection</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Anomalies Found</span>
                      <span className="font-bold text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Risk Level</span>
                      <span className="font-bold text-yellow-600">Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityMetrics;
