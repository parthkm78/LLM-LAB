import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  FunnelIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import MetricsChart from '../components/MetricsChart';
import Button from '../components/Button';

const Analysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Mock data loading
    const loadAnalytics = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        summary: {
          totalExperiments: 156,
          avgQualityScore: 87.5,
          topPerformingTemp: 0.7,
          mostUsedPromptType: 'Creative Writing'
        },
        trends: [
          { date: '2024-01-01', coherence: 82, completeness: 88, readability: 85, relevance: 90 },
          { date: '2024-01-02', coherence: 85, completeness: 87, readability: 89, relevance: 88 },
          { date: '2024-01-03', coherence: 88, completeness: 91, readability: 86, relevance: 92 },
          { date: '2024-01-04', coherence: 87, completeness: 89, readability: 88, relevance: 89 },
          { date: '2024-01-05', coherence: 90, completeness: 93, readability: 91, relevance: 94 },
          { date: '2024-01-06', coherence: 89, completeness: 88, readability: 87, relevance: 91 },
          { date: '2024-01-07', coherence: 91, completeness: 95, readability: 93, relevance: 96 }
        ],
        topExperiments: [
          { id: 1, prompt: 'Write a professional email...', score: 96, temp: 0.3, date: '2024-01-07' },
          { id: 2, prompt: 'Explain quantum computing...', score: 94, temp: 0.5, date: '2024-01-06' },
          { id: 3, prompt: 'Create a marketing strategy...', score: 92, temp: 0.7, date: '2024-01-05' },
          { id: 4, prompt: 'Write a technical guide...', score: 91, temp: 0.4, date: '2024-01-07' },
          { id: 5, prompt: 'Generate product description...', score: 89, temp: 0.6, date: '2024-01-06' }
        ]
      });
    };

    loadAnalytics();
  }, [selectedTimeRange]);

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'coherence', label: 'Coherence' },
    { value: 'completeness', label: 'Completeness' },
    { value: 'readability', label: 'Readability' },
    { value: 'relevance', label: 'Relevance' }
  ];

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Analysis</h1>
            <p className="text-gray-600">Comprehensive insights into your LLM response quality</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Experiments</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.summary.totalExperiments}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.summary.avgQualityScore}%</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Temperature</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.summary.topPerformingTemp}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{analyticsData.summary.mostUsedPromptType}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Quality Trends Chart */}
        <div className="xl:col-span-2">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Trends Over Time</h3>
            <MetricsChart 
              data={analyticsData.trends} 
              selectedMetric={selectedMetric}
              height={300}
            />
          </Card>
        </div>

        {/* Top Performing Experiments */}
        <div>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Experiments</h3>
            <div className="space-y-4">
              {analyticsData.topExperiments.map((experiment, index) => (
                <div key={experiment.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">{experiment.score}%</span>
                    </div>
                    <span className="text-xs text-gray-500">{experiment.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">
                    {experiment.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Temperature: {experiment.temp}</span>
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Parameter Performance Analysis */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Parameter Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-4">Temperature Distribution</h4>
              <div className="space-y-2">
                {[0.3, 0.5, 0.7, 0.9].map(temp => (
                  <div key={temp} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{temp}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${temp === 0.7 ? 85 : Math.random() * 60 + 20}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {temp === 0.7 ? '85%' : Math.floor(Math.random() * 60 + 20) + '%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-4">Top P Distribution</h4>
              <div className="space-y-2">
                {[0.6, 0.8, 0.9, 1.0].map(topP => (
                  <div key={topP} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{topP}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                          style={{ width: `${topP === 0.9 ? 78 : Math.random() * 60 + 15}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {topP === 0.9 ? '78%' : Math.floor(Math.random() * 60 + 15) + '%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-4">Quality by Length</h4>
              <div className="space-y-2">
                {['Short (< 100)', 'Medium (100-300)', 'Long (300-500)', 'Very Long (> 500)'].map((length, index) => (
                  <div key={length} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{length}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                          style={{ width: `${index === 1 ? 82 : Math.random() * 60 + 25}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {index === 1 ? '82%' : Math.floor(Math.random() * 60 + 25) + '%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
