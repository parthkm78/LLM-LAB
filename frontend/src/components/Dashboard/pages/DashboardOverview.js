import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  BeakerIcon, 
  DocumentTextIcon, 
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor } from '../../../styles/designTokens';

const DashboardOverview = ({ section = 'overview' }) => {
  const [quickStats] = useState({
    totalExperiments: 247,
    avgQualityScore: 87,
    topPerformingModel: 'GPT-4',
    experimentsToday: 12,
    responseAnalyzed: 1540,
    avgResponseTime: '2.3s'
  });

  const [recentExperiments] = useState([
    {
      id: 1,
      name: 'Creative Writing Analysis',
      model: 'GPT-4',
      parameters: { temperature: 0.8, top_p: 0.9 },
      qualityScore: 91,
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Technical Documentation',
      model: 'Claude-3',
      parameters: { temperature: 0.3, top_p: 0.8 },
      qualityScore: 89,
      timestamp: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Code Generation Test',
      model: 'GPT-4',
      parameters: { temperature: 0.2, top_p: 0.7 },
      qualityScore: 93,
      timestamp: '6 hours ago',
      status: 'completed'
    }
  ]);

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
          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
          <span className="text-sm text-emerald-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-left group"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mt-1">{description}</p>
          <div className="flex items-center mt-3 text-blue-600 font-medium">
            <span className="text-sm">Get Started</span>
            <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  );

  if (section === 'recent') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Experiments
          </button>
        </div>

        <div className="space-y-4">
          {recentExperiments.map((experiment) => (
            <div key={experiment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{experiment.name}</h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {experiment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Model: {experiment.model}</span>
                    <span>•</span>
                    <span>Temp: {experiment.parameters.temperature}</span>
                    <span>•</span>
                    <span>Top-p: {experiment.parameters.top_p}</span>
                    <span>•</span>
                    <span>{experiment.timestamp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: getQualityColor(experiment.qualityScore) }}>
                    {experiment.qualityScore}%
                  </div>
                  <div className="text-sm text-gray-500">Quality Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to LLM Analyzer
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your intelligent platform for LLM parameter optimization and quality analysis
            </p>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <PlayIcon className="w-5 h-5" />
                <span>Start New Experiment</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                <SparklesIcon className="w-5 h-5" />
                <span>View Tutorial</span>
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center">
              <CpuChipIcon className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Experiments"
          value={quickStats.totalExperiments}
          subtitle="This month"
          icon={BeakerIcon}
          trend="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Avg Quality Score"
          value={`${quickStats.avgQualityScore}%`}
          subtitle="Across all experiments"
          icon={ChartBarIcon}
          trend="+5.2% improvement"
          color="emerald"
        />
        <StatCard
          title="Responses Analyzed"
          value={quickStats.responseAnalyzed}
          subtitle="Total processed"
          icon={DocumentTextIcon}
          trend="+18% this week"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Parameter Testing"
            description="Configure and test different LLM parameters for optimal results"
            icon={BeakerIcon}
            color="from-blue-500 to-blue-600"
            onClick={() => {/* Navigate to parameters */}}
          />
          <QuickActionCard
            title="Quality Analysis"
            description="Analyze response quality with comprehensive metrics"
            icon={ChartBarIcon}
            color="from-emerald-500 to-emerald-600"
            onClick={() => {/* Navigate to quality */}}
          />
          <QuickActionCard
            title="Batch Experiments"
            description="Run multiple parameter combinations simultaneously"
            icon={CpuChipIcon}
            color="from-purple-500 to-purple-600"
            onClick={() => {/* Navigate to batch */}}
          />
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Experiments</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {recentExperiments.slice(0, 3).map((experiment) => (
            <div key={experiment.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
                  <p className="text-sm text-gray-600">{experiment.model} • {experiment.timestamp}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: getQualityColor(experiment.qualityScore) }}>
                    {experiment.qualityScore}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
