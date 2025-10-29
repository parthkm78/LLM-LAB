import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  BeakerIcon, 
  DocumentTextIcon, 
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  PlusIcon,
  ChartPieIcon,
  TrophyIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { designTokens, getQualityColor } from '../../../styles/designTokens';

const DashboardOverview = ({ section = 'overview' }) => {
  // Enhanced stats with more metrics
  const [quickStats] = useState({
    totalExperiments: 1247,
    avgQualityScore: 87.3,
    experimentsToday: 23,
    responseAnalyzed: 5640,
    avgResponseTime: 1.8,
    topModel: 'GPT-4',
    successRate: 94.2,
    totalCost: 45.67,
    activeModels: 5,
    bestQuality: 96.8,
    improvementRate: 12.5,
    avgTokens: 420
  });

  // Chart data for trends
  const [qualityTrend] = useState([
    { day: 'Mon', quality: 82, experiments: 45 },
    { day: 'Tue', quality: 85, experiments: 52 },
    { day: 'Wed', quality: 87, experiments: 48 },
    { day: 'Thu', quality: 89, experiments: 61 },
    { day: 'Fri', quality: 91, experiments: 58 },
    { day: 'Sat', quality: 88, experiments: 35 },
    { day: 'Sun', quality: 87, experiments: 41 }
  ]);

  const [modelDistribution] = useState([
    { name: 'GPT-4', value: 45, color: '#3b82f6' },
    { name: 'Claude-3', value: 25, color: '#8b5cf6' },
    { name: 'GPT-3.5', value: 20, color: '#10b981' },
    { name: 'Gemini', value: 10, color: '#f59e0b' }
  ]);

  const [recentActivity] = useState([
    { time: '2m ago', action: 'Batch experiment completed', quality: 94, type: 'success' },
    { time: '5m ago', action: 'Parameter optimization started', quality: null, type: 'info' },
    { time: '12m ago', action: 'Quality analysis finished', quality: 89, type: 'success' },
    { time: '18m ago', action: 'New experiment created', quality: null, type: 'info' },
    { time: '25m ago', action: 'Response comparison completed', quality: 92, type: 'success' }
  ]);

  // Compact stat card component
  const CompactStatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', size = 'normal' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
            )}
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
        <p className={`font-bold text-gray-900 ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // Activity item component
  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 rounded-full ${
        activity.type === 'success' ? 'bg-emerald-500' : 
        activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
      }`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{activity.action}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
      {activity.quality && (
        <div className="text-right">
          <span className="text-sm font-medium" style={{ color: getQualityColor(activity.quality) }}>
            {activity.quality}%
          </span>
        </div>
      )}
    </div>
  );

  if (section === 'recent') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View All
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-full overflow-hidden">
      {/* Header Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <CompactStatCard
          title="Total Experiments"
          value={quickStats.totalExperiments.toLocaleString()}
          icon={BeakerIcon}
          trend="up"
          trendValue="+8.2%"
          color="blue"
          size="large"
        />
        <CompactStatCard
          title="Avg Quality"
          value={`${quickStats.avgQualityScore}%`}
          icon={TrophyIcon}
          trend="up"
          trendValue="+2.1%"
          color="emerald"
          size="large"
        />
        <CompactStatCard
          title="Today"
          value={quickStats.experimentsToday}
          subtitle="experiments"
          icon={ClockIcon}
          trend="up"
          trendValue="+15%"
          color="purple"
        />
        <CompactStatCard
          title="Success Rate"
          value={`${quickStats.successRate}%`}
          icon={SparklesIcon}
          trend="up"
          trendValue="+1.8%"
          color="indigo"
        />
        <CompactStatCard
          title="Responses"
          value={quickStats.responseAnalyzed.toLocaleString()}
          subtitle="analyzed"
          icon={DocumentTextIcon}
          color="orange"
        />
        <CompactStatCard
          title="Avg Time"
          value={`${quickStats.avgResponseTime}s`}
          icon={BoltIcon}
          trend="down"
          trendValue="-0.3s"
          color="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quality Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quality Trends</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600">Quality Score</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={qualityTrend}>
              <defs>
                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#374151' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area 
                type="monotone" 
                dataKey="quality" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#qualityGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={modelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {modelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#374151' }}
                itemStyle={{ color: '#6b7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {modelDistribution.map((model, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: model.color }}
                ></div>
                <span className="text-xs text-gray-600">{model.name}</span>
                <span className="text-xs font-medium text-gray-900">{model.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Additional Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best Quality Score</span>
              <span className="text-sm font-medium text-emerald-600">{quickStats.bestQuality}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Improvement Rate</span>
              <span className="text-sm font-medium text-blue-600">+{quickStats.improvementRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Cost</span>
              <span className="text-sm font-medium text-purple-600">${quickStats.totalCost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Models</span>
              <span className="text-sm font-medium text-orange-600">{quickStats.activeModels}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Tokens</span>
              <span className="text-sm font-medium text-cyan-600">{quickStats.avgTokens}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-left">
          <div className="flex items-center space-x-2">
            <PlayIcon className="w-5 h-5" />
            <span className="font-medium">New Experiment</span>
          </div>
          <p className="text-blue-100 text-xs mt-1">Start parameter testing</p>
        </button>
        
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-3 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-left">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Batch Analysis</span>
          </div>
          <p className="text-purple-100 text-xs mt-1">Run multiple tests</p>
        </button>
        
        <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg p-3 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-left">
          <div className="flex items-center space-x-2">
            <ChartPieIcon className="w-5 h-5" />
            <span className="font-medium">Quality Metrics</span>
          </div>
          <p className="text-emerald-100 text-xs mt-1">Analyze results</p>
        </button>
        
        <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-3 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-left">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span className="font-medium">Compare Results</span>
          </div>
          <p className="text-orange-100 text-xs mt-1">Side-by-side analysis</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;
