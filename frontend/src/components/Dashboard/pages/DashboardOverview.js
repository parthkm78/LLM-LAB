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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-xs font-bold">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">{title}</p>
        <p className={`font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  // Activity item component
  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-200">
      <div className={`w-3 h-3 rounded-full ${
        activity.type === 'success' ? 'bg-emerald-500' : 
        activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
      } shadow-sm`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{activity.action}</p>
        <p className="text-xs text-gray-600 font-medium">{activity.time}</p>
      </div>
      {activity.quality && (
        <div className="text-right">
          <span className="text-sm font-black px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm" style={{ color: getQualityColor(activity.quality) }}>
            {activity.quality}%
          </span>
        </div>
      )}
    </div>
  );

  if (section === 'recent') {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Recent Activity</h2>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
            View All
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      {/* Header Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Trend Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quality Trends</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-2"></div>
                <span className="text-gray-600 font-medium">Quality Score</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={qualityTrend}>
              <defs>
                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} fontWeight="500" />
              <YAxis stroke="#64748b" fontSize={12} fontWeight="500" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                itemStyle={{ color: '#3b82f6', fontWeight: '600' }}
              />
              <Area 
                type="monotone" 
                dataKey="quality" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#qualityGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Model Usage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={modelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {modelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                itemStyle={{ color: '#6b7280', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {modelDistribution.map((model, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg p-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: model.color }}
                ></div>
                <span className="text-xs text-gray-600 font-medium flex-1">{model.name}</span>
                <span className="text-xs font-bold text-gray-900">{model.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <span className="text-sm font-bold text-gray-700">Best Quality Score</span>
              <span className="text-sm font-black text-emerald-600 bg-white/60 px-2 py-1 rounded-full">{quickStats.bestQuality}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <span className="text-sm font-bold text-gray-700">Improvement Rate</span>
              <span className="text-sm font-black text-blue-600 bg-white/60 px-2 py-1 rounded-full">+{quickStats.improvementRate}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <span className="text-sm font-bold text-gray-700">Total Cost</span>
              <span className="text-sm font-black text-purple-600 bg-white/60 px-2 py-1 rounded-full">${quickStats.totalCost}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <span className="text-sm font-bold text-gray-700">Active Models</span>
              <span className="text-sm font-black text-orange-600 bg-white/60 px-2 py-1 rounded-full">{quickStats.activeModels}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <span className="text-sm font-bold text-gray-700">Avg Tokens</span>
              <span className="text-sm font-black text-cyan-600 bg-white/60 px-2 py-1 rounded-full">{quickStats.avgTokens}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all duration-200">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold">New Experiment</span>
          </div>
          <p className="text-blue-100 text-xs mt-2 font-medium">Start parameter testing</p>
        </button>
        
        <button className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold">Batch Analysis</span>
          </div>
          <p className="text-purple-100 text-xs mt-2 font-medium">Run multiple tests</p>
        </button>
        
        <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-4 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <ChartPieIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold">Quality Metrics</span>
          </div>
          <p className="text-emerald-100 text-xs mt-2 font-medium">Analyze results</p>
        </button>
        
        <button className="group bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold">Compare Results</span>
          </div>
          <p className="text-orange-100 text-xs mt-2 font-medium">Side-by-side analysis</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;
