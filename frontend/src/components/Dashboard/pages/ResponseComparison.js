import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  BookmarkIcon, 
  ShareIcon, 
  ArrowsRightLeftIcon, 
  XMarkIcon, 
  TrashIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BeakerIcon,
  CogIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid
} from '@heroicons/react/24/solid';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';

const ResponseComparison = () => {
  // Core State Management
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [viewMode, setViewMode] = useState('all-responses'); // 'all-responses', 'search-and-select', 'detailed-comparison', 'advanced-analysis'
  const [comparisonMode, setComparisonMode] = useState('comprehensive'); // 'comprehensive', 'metrics-only', 'content-only', 'performance'
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    model: 'all',
    qualityRange: [0, 100],
    timeRange: 'all',
    sortBy: 'quality', // 'quality', 'time', 'cost', 'creativity', 'relevance'
    sortOrder: 'desc',
    showFavorites: false,
    minTokens: 0,
    maxCost: 1.0,
    tags: [],
    dateRange: { start: null, end: null }
  });
  
  // Advanced UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'experiments', 'benchmarks', 'custom'
  const [favorites, setFavorites] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());

  // Mock Data - Enhanced Response Library
  const mockResponses = [
    {
      id: 1,
      model: 'GPT-4',
      content: 'Neural networks are computational models inspired by biological neural networks in the brain. They consist of interconnected nodes (neurons) organized in layers: input, hidden, and output layers. Each connection has a weight that determines the strength of the signal. During training, the network adjusts these weights using backpropagation and gradient descent to minimize prediction errors. Forward propagation moves data through the network, while backpropagation updates weights based on the loss function. This process enables the network to learn complex patterns and relationships in data.',
      responseTime: 2.3,
      cost: 0.0045,
      timestamp: '2024-10-29 14:30',
      experiment: 'Neural Network Explanation',
      metrics: {
        overall_quality: 92,
        accuracy_score: 94,
        relevance_score: 91,
        coherence_score: 89,
        completeness_score: 95,
        readability_score: 88,
        creativity_score: 76,
        engagement_score: 85,
        technical_depth: 93
      },
      tags: ['technical', 'explanation', 'ai'],
      tokenCount: 156,
      confidence: 0.94
    },
    {
      id: 2,
      model: 'Claude-3.5',
      content: 'Think of neural networks as digital brains that learn from examples. Just like how your brain has billions of neurons connected together, artificial neural networks have layers of artificial neurons. Each neuron receives information, processes it, and passes it along. The magic happens during training - the network looks at thousands of examples and gradually gets better at recognizing patterns. It\'s like teaching a child to recognize cats by showing them many pictures of cats until they can identify one on their own.',
      responseTime: 1.8,
      cost: 0.0032,
      timestamp: '2024-10-29 14:32',
      experiment: 'Neural Network Explanation',
      metrics: {
        overall_quality: 88,
        accuracy_score: 87,
        relevance_score: 92,
        coherence_score: 94,
        completeness_score: 82,
        readability_score: 96,
        creativity_score: 89,
        engagement_score: 93,
        technical_depth: 78
      },
      tags: ['accessible', 'analogy', 'beginner'],
      tokenCount: 124,
      confidence: 0.91
    },
    {
      id: 3,
      model: 'Gemini-Pro',
      content: 'Neural networks represent a paradigm shift in computational approaches to problem-solving. These architectures leverage hierarchical feature extraction through multiple layers of interconnected processing units. The fundamental principle relies on the universal approximation theorem, which states that a feedforward network with sufficient hidden units can approximate any continuous function. Training involves optimization of a loss function through gradient-based methods, utilizing the chain rule for efficient backpropagation of errors.',
      responseTime: 3.1,
      cost: 0.0038,
      timestamp: '2024-10-29 14:35',
      experiment: 'Neural Network Explanation',
      metrics: {
        overall_quality: 85,
        accuracy_score: 96,
        relevance_score: 88,
        coherence_score: 83,
        completeness_score: 89,
        readability_score: 72,
        creativity_score: 68,
        engagement_score: 71,
        technical_depth: 97
      },
      tags: ['academic', 'technical', 'advanced'],
      tokenCount: 89,
      confidence: 0.89
    }
  ];

  const [allResponses] = useState(mockResponses);

  // Enhanced Search and Filter Functions
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const getFilteredResponses = () => {
    let filtered = allResponses.filter(response => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${response.content} ${response.model} ${response.experiment} ${response.tags?.join(' ') || ''}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Model filter
      if (activeFilters.model !== 'all' && response.model !== activeFilters.model) {
        return false;
      }

      // Quality range filter
      if (response.metrics.overall_quality < activeFilters.qualityRange[0] || 
          response.metrics.overall_quality > activeFilters.qualityRange[1]) {
        return false;
      }

      // Cost filter
      if (response.cost > activeFilters.maxCost) {
        return false;
      }

      // Favorites filter
      if (activeFilters.showFavorites && !favorites.has(response.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'experiments' && !response.experiment) return false;
        if (selectedCategory === 'benchmarks' && !response.tags?.includes('benchmark')) return false;
        if (selectedCategory === 'custom' && !response.tags?.includes('custom')) return false;
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (activeFilters.sortBy) {
        case 'quality':
          aValue = a.metrics.overall_quality;
          bValue = b.metrics.overall_quality;
          break;
        case 'time':
          aValue = a.responseTime;
          bValue = b.responseTime;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'creativity':
          aValue = a.metrics.creativity_score;
          bValue = b.metrics.creativity_score;
          break;
        case 'relevance':
          aValue = a.metrics.relevance_score;
          bValue = b.metrics.relevance_score;
          break;
        default:
          aValue = a.metrics.overall_quality;
          bValue = b.metrics.overall_quality;
      }

      if (activeFilters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  };

  const getPaginatedResponses = () => {
    const filtered = getFilteredResponses();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredResponses().length / itemsPerPage);
  };

  // Utility Functions
  const toggleFavorite = (responseId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(responseId)) {
        newFavorites.delete(responseId);
      } else {
        newFavorites.add(responseId);
      }
      return newFavorites;
    });
  };

  const toggleBookmark = (responseId) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(responseId)) {
        newBookmarks.delete(responseId);
      } else {
        newBookmarks.add(responseId);
      }
      return newBookmarks;
    });
  };

  const getQualityColor = (score) => {
    if (score >= 90) return '#10b981'; // emerald-500
    if (score >= 80) return '#3b82f6'; // blue-500
    if (score >= 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getModelColor = (model) => {
    const colors = {
      'GPT-4': 'bg-emerald-100 text-emerald-800',
      'Claude-3.5': 'bg-blue-100 text-blue-800',
      'Gemini-Pro': 'bg-purple-100 text-purple-800',
      'GPT-3.5': 'bg-orange-100 text-orange-800',
      'PaLM-2': 'bg-pink-100 text-pink-800'
    };
    return colors[model] || 'bg-gray-100 text-gray-800';
  };

  const addToComparison = (response) => {
    if (selectedResponses.length < 6 && !selectedResponses.some(r => r.id === response.id)) {
      setSelectedResponses(prev => [...prev, response]);
    }
  };

  const removeFromComparison = (responseId) => {
    setSelectedResponses(prev => prev.filter(r => r.id !== responseId));
  };

  const clearComparison = () => {
    setSelectedResponses([]);
  };

  // Advanced Search Interface Component
  const SearchInterface = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Response Library</h2>
          <p className="text-gray-600 mt-1">Search and select responses for detailed comparison</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {getFilteredResponses().length} responses found
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search responses by content, model, experiment, or tags..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-4 mb-6 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Responses', icon: DocumentTextIcon },
          { id: 'experiments', label: 'Experiments', icon: BeakerIcon },
          { id: 'benchmarks', label: 'Benchmarks', icon: ChartBarIcon },
          { id: 'custom', label: 'Custom', icon: CogIcon }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <select
            value={activeFilters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Models</option>
            <option value="GPT-4">GPT-4</option>
            <option value="Claude-3.5">Claude-3.5</option>
            <option value="Gemini-Pro">Gemini-Pro</option>
            <option value="GPT-3.5">GPT-3.5</option>
            <option value="PaLM-2">PaLM-2</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={activeFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="quality">Quality Score</option>
            <option value="relevance">Relevance</option>
            <option value="creativity">Creativity</option>
            <option value="time">Response Time</option>
            <option value="cost">Cost</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
          <select
            value={activeFilters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>

        {/* Quality Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality Range: {activeFilters.qualityRange[0]}% - {activeFilters.qualityRange[1]}%
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={activeFilters.qualityRange[0]}
              onChange={(e) => handleFilterChange('qualityRange', [Number(e.target.value), activeFilters.qualityRange[1]])}
              className="flex-1"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={activeFilters.qualityRange[1]}
              onChange={(e) => handleFilterChange('qualityRange', [activeFilters.qualityRange[0], Number(e.target.value)])}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => handleFilterChange('showFavorites', !activeFilters.showFavorites)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            activeFilters.showFavorites
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <HeartIcon className="w-4 h-4" />
          <span>Favorites Only</span>
        </button>
        
        <button
          onClick={() => {
            setSearchQuery('');
            setActiveFilters({
              model: 'all',
              qualityRange: [0, 100],
              timeRange: 'all',
              sortBy: 'quality',
              sortOrder: 'desc',
              showFavorites: false,
              minTokens: 0,
              maxCost: 1.0,
              tags: [],
              dateRange: { start: null, end: null }
            });
            setSelectedCategory('all');
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );

  // Basic Response Card Component
  const ResponseCard = ({ response, isSelected = false, showAddButton = true }) => (
    <div className={`bg-white rounded-lg border-2 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getModelColor(response.model)}`}>
            {response.model}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{response.timestamp}</span>
            {showAddButton && (
              isSelected ? (
                <button
                  onClick={() => removeFromComparison(response.id)}
                  className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => addToComparison(response)}
                  className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-4">{response.content}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Overall Quality</span>
            <span className="text-sm font-bold" style={{ color: getQualityColor(response.metrics.overall_quality) }}>
              {response.metrics.overall_quality}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Relevance</span>
            <span className="text-sm font-bold" style={{ color: getQualityColor(response.metrics.relevance_score) }}>
              {response.metrics.relevance_score}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Response Time</span>
            <span className="text-sm font-bold text-gray-700">{response.responseTime}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Cost</span>
            <span className="text-sm font-bold text-gray-700">${response.cost.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Response Card Component
  const EnhancedResponseCard = ({ response, isSelected = false, showAddButton = true, index }) => (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
      isSelected 
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 transform scale-[1.02]' 
        : 'border-gray-200 hover:border-blue-300'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isSelected && (
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
            )}
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getModelColor(response.model)}`}>
              {response.model}
            </span>
            <div className="flex items-center space-x-1">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-gray-700">{response.metrics.overall_quality}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">{response.content}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-lg font-bold" style={{ color: getQualityColor(response.metrics.accuracy_score) }}>
              {response.metrics.accuracy_score}%
            </div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-lg font-bold" style={{ color: getQualityColor(response.metrics.creativity_score) }}>
              {response.metrics.creativity_score}%
            </div>
            <div className="text-xs text-gray-600">Creativity</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-lg font-bold text-blue-600">
              {response.responseTime}s
            </div>
            <div className="text-xs text-gray-600">Response Time</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-lg font-bold text-green-600">
              ${response.cost.toFixed(4)}
            </div>
            <div className="text-xs text-gray-600">Cost</div>
          </div>
        </div>

        {/* Tags */}
        {response.tags && (
          <div className="flex flex-wrap gap-1 mb-4">
            {response.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => toggleFavorite(response.id)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                favorites.has(response.id) 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {favorites.has(response.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => toggleBookmark(response.id)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                bookmarks.has(response.id) 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {bookmarks.has(response.id) ? <BookmarkIconSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-300">
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
          
          {showAddButton && (
            <button
              onClick={() => isSelected ? removeFromComparison(response.id) : addToComparison(response)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isSelected
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSelected ? 'Remove' : 'Add to Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Comprehensive Comparison Analytics Component
  const ComparisonAnalytics = ({ responses }) => {
    if (responses.length < 2) return null;

    const metricKeys = ['accuracy_score', 'relevance_score', 'coherence_score', 'completeness_score', 'readability_score', 'creativity_score', 'engagement_score', 'technical_depth'];
    
    const radarData = metricKeys.map(key => ({
      metric: key.replace('_score', '').replace('_', ' ').replace(/^\w/, c => c.toUpperCase()),
      ...responses.reduce((acc, response, index) => ({
        ...acc,
        [`Response ${index + 1}`]: response.metrics[key]
      }), {})
    }));

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Comparison Analytics</h3>
        
        {/* Radar Chart */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics Comparison</h4>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              {responses.map((_, index) => (
                <Radar
                  key={index}
                  name={`Response ${index + 1}`}
                  dataKey={`Response ${index + 1}`}
                  stroke={`hsl(${index * 60}, 70%, 50%)`}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                {responses.map((response, index) => (
                  <th key={index} className="text-center py-3 px-4 font-semibold text-gray-900">
                    {response.model} #{index + 1}
                  </th>
                ))}
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Average</th>
              </tr>
            </thead>
            <tbody>
              {metricKeys.map((key) => (
                <tr key={key} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {key.replace('_score', '').replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </td>
                  {responses.map((response, index) => (
                    <td key={index} className="text-center py-3 px-4">
                      <span className="font-medium" style={{ color: getQualityColor(response.metrics[key]) }}>
                        {response.metrics[key]}%
                      </span>
                    </td>
                  ))}
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-700 font-medium">
                      {Math.round(responses.reduce((sum, r) => sum + r.metrics[key], 0) / responses.length)}%
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium text-gray-900">Response Time</td>
                {responses.map((response, index) => (
                  <td key={index} className="text-center py-3 px-4">
                    <span className="text-gray-700 font-medium">{response.responseTime}s</span>
                  </td>
                ))}
                <td className="text-center py-3 px-4">
                  <span className="text-gray-700 font-medium">
                    {(responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length).toFixed(1)}s
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium text-gray-900">Cost</td>
                {responses.map((response, index) => (
                  <td key={index} className="text-center py-3 px-4">
                    <span className="text-gray-700 font-medium">${response.cost.toFixed(4)}</span>
                  </td>
                ))}
                <td className="text-center py-3 px-4">
                  <span className="text-gray-700 font-medium">
                    ${(responses.reduce((sum, r) => sum + r.cost, 0) / responses.length).toFixed(4)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Detailed Comparison View Component
  const DetailedComparisonView = () => {
    if (selectedResponses.length === 0) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ArrowsRightLeftIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Ready for Detailed Comparison
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Select up to 6 responses from the library above to start a comprehensive comparison with detailed analytics.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Side-by-side Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <BeakerIcon className="w-5 h-5" />
              <span>Quality Metrics</span>
            </div>
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="w-5 h-5" />
              <span>Performance Stats</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Comparison Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Detailed Response Comparison</h2>
              <p className="text-blue-100 text-lg">
                Analyzing {selectedResponses.length} response{selectedResponses.length !== 1 ? 's' : ''} with comprehensive metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={clearComparison}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Clear All</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300">
                <ShareIcon className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {Math.max(...selectedResponses.map(r => r.metrics.overall_quality))}%
            </div>
            <div className="text-gray-600 font-medium">Highest Quality</div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedResponses.find(r => r.metrics.overall_quality === Math.max(...selectedResponses.map(r => r.metrics.overall_quality)))?.model}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.min(...selectedResponses.map(r => r.responseTime)).toFixed(1)}s
            </div>
            <div className="text-gray-600 font-medium">Fastest Response</div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedResponses.find(r => r.responseTime === Math.min(...selectedResponses.map(r => r.responseTime)))?.model}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.max(...selectedResponses.map(r => r.metrics.creativity_score))}%
            </div>
            <div className="text-gray-600 font-medium">Most Creative</div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedResponses.find(r => r.metrics.creativity_score === Math.max(...selectedResponses.map(r => r.metrics.creativity_score)))?.model}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              ${Math.min(...selectedResponses.map(r => r.cost)).toFixed(4)}
            </div>
            <div className="text-gray-600 font-medium">Lowest Cost</div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedResponses.find(r => r.cost === Math.min(...selectedResponses.map(r => r.cost)))?.model}
            </div>
          </div>
        </div>

        {/* Response Cards Grid */}
        <div className={`grid gap-6 ${
          selectedResponses.length === 1 ? 'grid-cols-1' :
          selectedResponses.length === 2 ? 'grid-cols-1 xl:grid-cols-2' :
          selectedResponses.length === 3 ? 'grid-cols-1 xl:grid-cols-3' :
          selectedResponses.length === 4 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4' :
          selectedResponses.length === 5 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-5' :
          'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'
        }`}>
          {selectedResponses.map((response, index) => (
            <EnhancedResponseCard 
              key={response.id} 
              response={response} 
              index={index}
              isSelected={true}
              showAddButton={false}
            />
          ))}
        </div>

        {/* Comprehensive Analytics */}
        {selectedResponses.length > 1 && <ComparisonAnalytics responses={selectedResponses} />}
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredResponses().length)} of {getFilteredResponses().length} responses
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 3 || page === currentPage + 3) {
              return <span key={page} className="px-2">...</span>;
            }
            return null;
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // All Responses View Component
  const AllResponsesView = () => (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">{allResponses.length}</div>
          <div className="text-gray-600 font-medium">Total Responses</div>
          <div className="text-xs text-gray-500 mt-1">Available for analysis</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {Math.round(allResponses.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / allResponses.length)}%
          </div>
          <div className="text-gray-600 font-medium">Average Quality</div>
          <div className="text-xs text-gray-500 mt-1">Across all responses</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {new Set(allResponses.map(r => r.model)).size}
          </div>
          <div className="text-gray-600 font-medium">Models</div>
          <div className="text-xs text-gray-500 mt-1">Different LLM models</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            {selectedResponses.length}
          </div>
          <div className="text-gray-600 font-medium">Selected</div>
          <div className="text-xs text-gray-500 mt-1">For comparison</div>
        </div>
      </div>

      {/* Quick Start Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Quick Start Your Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setViewMode('search-and-select')}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group"
          >
            <MagnifyingGlassIcon className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Search & Filter</h3>
            <p className="text-gray-600 text-sm">Find specific responses using advanced search and filtering options</p>
          </button>
          
          <button
            onClick={() => setViewMode('detailed-comparison')}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group"
          >
            <ArrowsRightLeftIcon className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Compare Responses</h3>
            <p className="text-gray-600 text-sm">Side-by-side comparison with detailed metrics and insights</p>
          </button>
          
          <button
            onClick={() => setViewMode('advanced-analysis')}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group"
          >
            <ChartBarIcon className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Analysis</h3>
            <p className="text-gray-600 text-sm">Comprehensive analysis with interactive charts and deep insights</p>
          </button>
        </div>
      </div>

      {/* Response Library Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Response Library Preview</h3>
          <button
            onClick={() => setViewMode('search-and-select')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Responses
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResponses.slice(0, 6).map((response) => (
            <ResponseCard 
              key={response.id} 
              response={response} 
              isSelected={selectedResponses.some(r => r.id === response.id)}
              showAddButton={true}
            />
          ))}
        </div>
        
        {allResponses.length > 6 && (
          <div className="text-center mt-6">
            <p className="text-gray-500 mb-4">Showing 6 of {allResponses.length} responses</p>
            <button
              onClick={() => setViewMode('search-and-select')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All {allResponses.length} Responses
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Advanced Analysis Component
  const AdvancedAnalysisView = () => {
    const [analysisTab, setAnalysisTab] = useState('overview'); // 'overview', 'comparison', 'insights', 'charts'
    
    return (
      <div className="space-y-8">
        {/* Analysis Header */}
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Advanced Response Analysis</h2>
              <p className="text-blue-100 text-lg">
                Deep insights and comprehensive metrics for {selectedResponses.length > 0 ? `${selectedResponses.length} selected responses` : 'all responses'}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setViewMode('search-and-select')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add More Responses</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300">
                <ShareIcon className="w-4 h-4" />
                <span>Export Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-2">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview & Stats', icon: ChartBarIcon },
              { id: 'comparison', label: 'Detailed Comparison', icon: ArrowsRightLeftIcon },
              { id: 'insights', label: 'AI Insights', icon: BeakerIcon },
              { id: 'charts', label: 'Interactive Charts', icon: CpuChipIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAnalysisTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  analysisTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {analysisTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <StarIconSolid className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">Quality</span>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {selectedResponses.length > 0 
                    ? Math.round(selectedResponses.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / selectedResponses.length)
                    : Math.round(allResponses.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / allResponses.length)
                  }%
                </div>
                <div className="text-emerald-700 text-sm">Average Quality Score</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CpuChipIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Performance</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {selectedResponses.length > 0 
                    ? (selectedResponses.reduce((sum, r) => sum + r.responseTime, 0) / selectedResponses.length).toFixed(1)
                    : (allResponses.reduce((sum, r) => sum + r.responseTime, 0) / allResponses.length).toFixed(1)
                  }s
                </div>
                <div className="text-blue-700 text-sm">Average Response Time</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <BeakerIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-purple-600 text-sm font-medium">Creativity</span>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {selectedResponses.length > 0 
                    ? Math.round(selectedResponses.reduce((sum, r) => sum + r.metrics.creativity_score, 0) / selectedResponses.length)
                    : Math.round(allResponses.reduce((sum, r) => sum + r.metrics.creativity_score, 0) / allResponses.length)
                  }%
                </div>
                <div className="text-purple-700 text-sm">Average Creativity Score</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-amber-600 text-sm font-medium">Cost</span>
                </div>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  ${selectedResponses.length > 0 
                    ? (selectedResponses.reduce((sum, r) => sum + r.cost, 0) / selectedResponses.length).toFixed(4)
                    : (allResponses.reduce((sum, r) => sum + r.cost, 0) / allResponses.length).toFixed(4)
                  }
                </div>
                <div className="text-amber-700 text-sm">Average Cost per Request</div>
              </div>
            </div>

            {/* Response Selection Interface */}
            {selectedResponses.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
                <div className="text-center">
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Select Responses for Analysis</h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Choose specific responses from the library to perform detailed comparison and analysis. You can select up to 6 responses.
                  </p>
                  <button
                    onClick={() => setViewMode('search-and-select')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg"
                  >
                    Browse Response Library
                  </button>
                </div>
              </div>
            )}

            {/* Selected Responses Overview */}
            {selectedResponses.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Selected Responses ({selectedResponses.length})</h3>
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedResponses.map((response, index) => (
                    <EnhancedResponseCard 
                      key={response.id} 
                      response={response} 
                      index={index}
                      isSelected={true}
                      showAddButton={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {analysisTab === 'comparison' && (
          <div className="space-y-8">
            {selectedResponses.length > 1 ? (
              <ComparisonAnalytics responses={selectedResponses} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
                <ArrowsRightLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Select Multiple Responses</h3>
                <p className="text-gray-600 mb-8">
                  Choose at least 2 responses to see detailed comparison analytics and insights.
                </p>
                <button
                  onClick={() => setViewMode('search-and-select')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select More Responses
                </button>
              </div>
            )}
          </div>
        )}

        {analysisTab === 'insights' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
            <BeakerIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
            <p className="text-gray-600 mb-8">
              Advanced AI analysis and recommendations based on response patterns and quality metrics.
            </p>
            <div className="text-blue-600 font-medium">Coming Soon...</div>
          </div>
        )}

        {analysisTab === 'charts' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
            <CpuChipIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Data Visualization</h3>
            <p className="text-gray-600 mb-8">
              Dynamic charts and visualizations for deep data exploration and pattern discovery.
            </p>
            <div className="text-purple-600 font-medium">Coming Soon...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-bold mb-3">
                  <BeakerIcon className="w-4 h-4 mr-2" />
                  Parameter Testing Lab
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Response Comparison</h1>
                <p className="text-blue-100 text-lg font-medium max-w-2xl">
                  Search, select, and compare LLM responses with advanced analytics and detailed insights
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-gray-700 font-medium shadow-lg"
                  >
                    <option value="all-responses">All Responses</option>
                    <option value="search-and-select">Search & Select</option>
                    <option value="detailed-comparison">Detailed Comparison</option>
                    <option value="advanced-analysis">Advanced Analysis</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'search-and-select' && (
          <div className="space-y-8">
            {/* Search Interface */}
            <SearchInterface />
            
            {/* Response Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getPaginatedResponses().map((response) => (
                  <ResponseCard 
                    key={response.id} 
                    response={response} 
                    isSelected={selectedResponses.some(r => r.id === response.id)}
                    showAddButton={true}
                  />
                ))}
              </div>
              
              {/* No Results Message */}
              {getFilteredResponses().length === 0 && (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              )}
              
              {/* Pagination */}
              <Pagination />
            </div>

            {/* Selected Responses Preview */}
            {selectedResponses.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Selected for Comparison ({selectedResponses.length})
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedResponses.length < 6 ? `Add ${6 - selectedResponses.length} more responses for comprehensive analysis` : 'Maximum responses selected'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={clearComparison}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setViewMode('detailed-comparison')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Compare Responses
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {selectedResponses.map((response, index) => (
                    <div key={response.id} className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        <button
                          onClick={() => removeFromComparison(response.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-gray-600 mb-1">{response.model}</div>
                      <div className="text-sm text-gray-700 mb-2 line-clamp-2">{response.content}</div>
                      <div className="text-xs text-gray-500">
                        Quality: <span className="font-bold">{response.metrics.overall_quality}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'detailed-comparison' && (
          <DetailedComparisonView />
        )}

        {viewMode === 'all-responses' && (
          <AllResponsesView />
        )}

        {viewMode === 'advanced-analysis' && (
          <AdvancedAnalysisView />
        )}
      </div>
    </div>
  );
};

export default ResponseComparison;
