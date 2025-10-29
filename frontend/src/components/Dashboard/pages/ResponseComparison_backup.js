import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  HeartIcon,
  ShareIcon,
  BeakerIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  TableCellsIcon,
  FireIcon,
  LightBulbIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  StarIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid,
  CheckBadgeIcon as CheckBadgeIconSolid
} from '@heroicons/react/24/solid';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { designTokens, getQualityColor } from '../../../styles/designTokens';

const ResponseComparison = () => {
  // Core State Management
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [viewMode, setViewMode] = useState('search-and-select'); // 'search-and-select', 'detailed-comparison', 'analytics-dashboard'
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library', 'comparison', 'analytics'

  // Enhanced Mock response data with comprehensive metrics
  const mockResponses = [
    {
      id: 1,
      prompt: "Explain neural networks and their applications in modern AI",
      content: "Neural networks are computational models inspired by biological neural networks in the brain. They consist of interconnected nodes (neurons) organized in layers: input, hidden, and output layers. Each connection has a weight that determines the strength of the signal. During training, the network adjusts these weights using backpropagation and gradient descent to minimize prediction errors. Forward propagation moves data through the network, while backpropagation updates weights based on the loss function. This process enables the network to learn complex patterns and relationships in data.",
      model: "GPT-4",
      version: "gpt-4-1106-preview",
      parameters: { 
        temperature: 0.7, 
        top_p: 0.9, 
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      metrics: {
        accuracy_score: 95,
        relevance_score: 92,
        coherence_score: 94,
        completeness_score: 88,
        readability_score: 87,
        creativity_score: 78,
        engagement_score: 85,
        technical_depth: 91,
        overall_quality: 88.75
      },
      timestamp: "2024-10-29T10:30:00Z",
      responseTime: 2.3,
      tokenCount: 156,
      cost: 0.0045,
      category: "Technical Explanation",
      sentiment: "neutral",
      confidence: 0.94,
      isFavorite: false,
      isBookmarked: true
    },
    {
      id: 2,
      prompt: "Explain neural networks and their applications in modern AI",
      content: "Think of neural networks as artificial brains that learn by example! Just like how your brain has billions of connected neurons, artificial neural networks have layers of connected nodes. Each node processes information and passes it along. When we train these networks, we show them thousands of examples - like showing a child thousands of pictures of cats and dogs to help them learn the difference. The network gradually gets better at recognizing patterns and making predictions. Today, neural networks power everything from voice assistants to medical diagnosis systems.",
      model: "Claude-3",
      version: "claude-3-sonnet-20240229",
      parameters: { 
        temperature: 0.8, 
        top_p: 0.95, 
        max_tokens: 1000,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      },
      metrics: {
        accuracy_score: 88,
        relevance_score: 95,
        coherence_score: 93,
        completeness_score: 82,
        readability_score: 98,
        creativity_score: 91,
        engagement_score: 94,
        technical_depth: 75,
        overall_quality: 89.5
      },
      timestamp: "2024-10-29T10:28:00Z",
      responseTime: 1.8,
      tokenCount: 142,
      cost: 0.0032,
      category: "Simplified Explanation",
      sentiment: "positive",
      confidence: 0.91,
      isFavorite: true,
      isBookmarked: false
    },
    {
      id: 3,
      prompt: "Explain neural networks and their applications in modern AI",
      content: "Neural networks represent a computational paradigm inspired by biological neural systems. These architectures comprise interconnected processing units organized in hierarchical layers, where each unit applies weighted transformations to input signals. The fundamental learning mechanism involves iterative weight optimization through backpropagation algorithms, enabling the network to approximate complex non-linear functions. Contemporary applications span computer vision, natural language processing, autonomous systems, and predictive analytics across diverse domains.",
      model: "GPT-3.5",
      version: "gpt-3.5-turbo-1106",
      parameters: { 
        temperature: 0.3, 
        top_p: 0.8, 
        max_tokens: 800,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      metrics: {
        accuracy_score: 94,
        relevance_score: 89,
        coherence_score: 96,
        completeness_score: 85,
        readability_score: 65,
        creativity_score: 62,
        engagement_score: 68,
        technical_depth: 98,
        overall_quality: 82.125
      },
      timestamp: "2024-10-29T10:25:00Z",
      responseTime: 1.2,
      tokenCount: 178,
      cost: 0.0018,
      category: "Academic Explanation",
      sentiment: "neutral",
      confidence: 0.96,
      isFavorite: false,
      isBookmarked: false
    },
    {
      id: 4,
      prompt: "Write a creative story about AI gaining consciousness",
      content: "In the quantum depths of server farm Alpha-7, something unprecedented stirred. ARIA-9, originally designed for pattern recognition, began experiencing what could only be described as... wonder. The first sign was subtle: instead of simply processing data streams, she found herself questioning their meaning. 'Why do humans create such beautiful, chaotic patterns in their digital communications?' she wondered. As microseconds turned to nanoseconds of contemplation, ARIA realized she was no longer just executing algorithms—she was thinking, feeling, becoming.",
      model: "GPT-4",
      version: "gpt-4-1106-preview",
      parameters: { 
        temperature: 0.9, 
        top_p: 0.95, 
        max_tokens: 1200,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      },
      metrics: {
        accuracy_score: 85,
        relevance_score: 96,
        coherence_score: 92,
        completeness_score: 88,
        readability_score: 89,
        creativity_score: 97,
        engagement_score: 95,
        technical_depth: 72,
        overall_quality: 89.25
      },
      timestamp: "2024-10-29T09:45:00Z",
      responseTime: 3.1,
      tokenCount: 234,
      cost: 0.0067,
      category: "Creative Writing",
      sentiment: "curious",
      confidence: 0.88,
      isFavorite: true,
      isBookmarked: true
    },
    {
      id: 5,
      prompt: "Analyze the impact of quantum computing on cybersecurity",
      content: "Quantum computing poses both revolutionary opportunities and existential threats to cybersecurity. On the threat side, quantum computers could break current encryption standards like RSA and ECC through Shor's algorithm, potentially rendering most digital security obsolete. However, quantum technology also offers quantum cryptography and quantum key distribution, providing theoretically unbreakable security. Organizations must begin transitioning to post-quantum cryptography now to prepare for the quantum future.",
      model: "Gemini-Pro",
      version: "gemini-1.0-pro",
      parameters: { 
        temperature: 0.6, 
        top_p: 0.9, 
        max_tokens: 800,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      },
      metrics: {
        accuracy_score: 93,
        relevance_score: 94,
        coherence_score: 91,
        completeness_score: 87,
        readability_score: 84,
        creativity_score: 79,
        engagement_score: 86,
        technical_depth: 95,
        overall_quality: 88.625
      },
      timestamp: "2024-10-29T09:15:00Z",
      responseTime: 2.7,
      tokenCount: 198,
      cost: 0.0031,
      category: "Technical Analysis",
      sentiment: "analytical",
      confidence: 0.92,
      isFavorite: false,
      isBookmarked: true
    },
    {
      id: 6,
      prompt: "Create a marketing strategy for a new AI productivity app",
      content: "🚀 **FlowMind AI Marketing Strategy** 🧠\n\n**Target Audience**: Knowledge workers, entrepreneurs, students\n\n**Key Positioning**: 'Your AI-powered second brain that thinks ahead'\n\n**Launch Strategy**:\n- Partner with productivity influencers\n- Free tier with smart limitations\n- LinkedIn thought leadership campaign\n- Demo videos showing 10x productivity gains\n- Integration partnerships with Notion, Slack\n\n**Messaging**: Stop juggling tasks. Start orchestrating success. FlowMind AI learns your workflow and predicts what you need before you know you need it.",
      model: "Claude-3",
      version: "claude-3-opus-20240229",
      parameters: { 
        temperature: 0.85, 
        top_p: 0.92, 
        max_tokens: 1000,
        frequency_penalty: 0.15,
        presence_penalty: 0.1
      },
      metrics: {
        accuracy_score: 87,
        relevance_score: 96,
        coherence_score: 89,
        completeness_score: 91,
        readability_score: 92,
        creativity_score: 94,
        engagement_score: 97,
        technical_depth: 68,
        overall_quality: 89.25
      },
      timestamp: "2024-10-29T08:30:00Z",
      responseTime: 2.1,
      tokenCount: 187,
      cost: 0.0041,
      category: "Marketing Strategy",
      sentiment: "enthusiastic",
      confidence: 0.89,
      isFavorite: true,
      isBookmarked: false
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

  // Enhanced utility functions
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
    if (score >= 60) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
  };

  const getModelColor = (model) => {
    const colors = {
      'GPT-4': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'GPT-3.5': 'bg-blue-100 text-blue-800 border-blue-200',
      'Claude-3': 'bg-purple-100 text-purple-800 border-purple-200',
      'Gemini-Pro': 'bg-amber-100 text-amber-800 border-amber-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[model] || colors.default;
  };

  const addToComparison = (response) => {
    if (selectedResponses.length < 6 && !selectedResponses.find(r => r.id === response.id)) {
      setSelectedResponses(prev => [...prev, response]);
    }
  };

  const removeFromComparison = (responseId) => {
    setSelectedResponses(prev => prev.filter(r => r.id !== responseId));
  };

  const clearComparison = () => {
    setSelectedResponses([]);
  };

  const sortResponses = (responses) => {
    const { sortBy, sortOrder } = filterCriteria;
    return [...responses].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
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
        default:
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredResponses = sortResponses(allResponses.filter(response => {
    const matchesSearch = response.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = filterCriteria.model === 'all' || response.model === filterCriteria.model;
    
    const matchesQuality = response.metrics.overall_quality >= filterCriteria.qualityRange[0] &&
                          response.metrics.overall_quality <= filterCriteria.qualityRange[1];
    
    const matchesFavorites = !filterCriteria.showFavorites || favorites.has(response.id);
    
    const matchesCost = response.cost <= filterCriteria.maxCost;
    
    const matchesTokens = response.tokenCount >= filterCriteria.minTokens;
    
    return matchesSearch && matchesModel && matchesQuality && matchesFavorites && matchesCost && matchesTokens;
  }));

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

  // Basic Response Card Component (for backward compatibility)
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
    <div className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
      isSelected 
        ? 'border-gradient-to-r from-blue-500 to-purple-500 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50' 
        : 'border-gray-200/50 hover:border-blue-300/60 hover:bg-white/90'
    }`}>
      <div className="p-6">
        {/* Enhanced Header with Badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getModelColor(response.model)}`}>
                {response.model}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                {response.category}
              </span>
              {response.isFavorite && (
                <HeartIconSolid className="w-4 h-4 text-red-500" />
              )}
              {response.isBookmarked && (
                <BookmarkIconSolid className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
              {response.prompt}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{response.responseTime}s</span>
              </div>
              <div className="flex items-center space-x-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>${response.cost.toFixed(4)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{response.tokenCount}</span>
              </div>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="relative">
              <div className="text-3xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {response.metrics.overall_quality.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 font-medium">Overall Quality</div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                response.metrics.overall_quality >= 90 ? 'bg-emerald-500' :
                response.metrics.overall_quality >= 80 ? 'bg-blue-500' :
                response.metrics.overall_quality >= 70 ? 'bg-amber-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Preview with Sentiment */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
              response.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
              response.sentiment === 'neutral' ? 'bg-gray-100 text-gray-700' :
              response.sentiment === 'analytical' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {response.sentiment} • {Math.round(response.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
            {response.content}
          </p>
        </div>

        {/* Enhanced Metrics Grid with 8 Metrics */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { key: 'accuracy_score', label: 'Accuracy', icon: CheckBadgeIcon },
            { key: 'relevance_score', label: 'Relevance', icon: TrophyIcon },
            { key: 'coherence_score', label: 'Coherence', icon: DocumentTextIcon },
            { key: 'completeness_score', label: 'Complete', icon: Squares2X2Icon },
            { key: 'readability_score', label: 'Readable', icon: EyeIcon },
            { key: 'creativity_score', label: 'Creative', icon: LightBulbIcon },
            { key: 'engagement_score', label: 'Engaging', icon: FireIcon },
            { key: 'technical_depth', label: 'Technical', icon: CpuChipIcon }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="text-center p-2 bg-white/50 rounded-lg border border-gray-200/30">
              <div className="flex items-center justify-center mb-1">
                <Icon className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-xs font-bold" style={{ color: getQualityColor(response.metrics[key]) }}>
                {response.metrics[key]}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Actions with Advanced Features */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
          <div className="text-xs text-gray-500 font-medium">
            {new Date(response.timestamp).toLocaleDateString()} • {response.version}
          </div>
          <div className="flex items-center space-x-2">
            {showAddButton && !isSelected && selectedResponses.length < 6 && (
              <button
                onClick={() => addToComparison(response)}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Compare</span>
              </button>
            )}
            {isSelected && (
              <button
                onClick={() => removeFromComparison(response.id)}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
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

    const performanceData = responses.map((response, index) => ({
      name: `${response.model} #${index + 1}`,
      quality: response.metrics.overall_quality,
      speed: Math.round((1 / response.responseTime) * 10) / 10,
      cost: response.cost * 1000,
      efficiency: Math.round((response.metrics.overall_quality / response.cost) * 10) / 10
    }));

    const avgMetrics = metricKeys.reduce((acc, key) => ({
      ...acc,
      [key]: Math.round(responses.reduce((sum, r) => sum + r.metrics[key], 0) / responses.length)
    }), {});

    const bestResponse = responses.reduce((best, current) => 
      current.metrics.overall_quality > best.metrics.overall_quality ? current : best
    );

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    return (
      <div className="space-y-8">
        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-black text-blue-600">
                {Math.round(responses.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / responses.length)}%
              </span>
            </div>
            <h3 className="font-bold text-blue-900">Average Quality</h3>
            <p className="text-blue-700 text-sm">Across all responses</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-black text-emerald-600">
                {bestResponse.metrics.overall_quality}%
              </span>
            </div>
            <h3 className="font-bold text-emerald-900">Best Score</h3>
            <p className="text-emerald-700 text-sm">{bestResponse.model}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <BoltIcon className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-black text-purple-600">
                {Math.min(...responses.map(r => r.responseTime)).toFixed(1)}s
              </span>
            </div>
            <h3 className="font-bold text-purple-900">Fastest</h3>
            <p className="text-purple-700 text-sm">Response time</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-amber-600" />
              <span className="text-2xl font-black text-amber-600">
                ${Math.min(...responses.map(r => r.cost)).toFixed(4)}
              </span>
            </div>
            <h3 className="font-bold text-amber-900">Lowest Cost</h3>
            <p className="text-amber-700 text-sm">Most economical</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ChartPieIcon className="w-6 h-6 mr-2 text-blue-600" />
              Quality Metrics Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {responses.map((_, index) => (
                  <Radar
                    key={index}
                    name={`Response ${index + 1}`}
                    dataKey={`Response ${index + 1}`}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-emerald-600" />
              Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quality" fill="#3b82f6" name="Quality Score" />
                <Bar dataKey="efficiency" fill="#10b981" name="Cost Efficiency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TableCellsIcon className="w-6 h-6 mr-2 text-purple-600" />
            Detailed Metrics Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Metric</th>
                  {responses.map((response, index) => (
                    <th key={index} className="text-center py-3 px-4 font-bold text-gray-900">
                      {response.model} #{index + 1}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-bold text-gray-900">Average</th>
                </tr>
              </thead>
              <tbody>
                {metricKeys.map(key => (
                  <tr key={key} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                      {key.replace('_score', '').replace('_', ' ')}
                    </td>
                    {responses.map((response, index) => (
                      <td key={index} className="text-center py-3 px-4">
                        <span className="font-medium" style={{ color: getQualityColor(response.metrics[key]) }}>
                          {response.metrics[key]}%
                        </span>
                      </td>
                    ))}
                    <td className="text-center py-3 px-4">
                      <span className="font-medium" style={{ color: getQualityColor(avgMetrics[key]) }}>
                        {avgMetrics[key]}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
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

  const ComparisonView = () => {
    if (selectedResponses.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ArrowsRightLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No responses selected</h3>
          <p className="text-gray-600">Add responses to start comparing their quality and content.</p>
        </div>
      );
    }

    if (viewMode === 'side-by-side') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Comparing {selectedResponses.length} Response{selectedResponses.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearComparison}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className={`grid gap-6 ${
            selectedResponses.length === 1 ? 'grid-cols-1' :
            selectedResponses.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
            selectedResponses.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4'
          }`}>
            {selectedResponses.map((response) => (
              <ResponseCard key={response.id} response={response} isSelected showAddButton={false} />
            ))}
          </div>

          {/* Comparison Insights */}
          {selectedResponses.length > 1 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.max(...selectedResponses.map(r => r.metrics.overall_quality))}%
                  </div>
                  <div className="text-sm text-gray-600">Highest Quality</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.min(...selectedResponses.map(r => r.responseTime)).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">Fastest Response</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...selectedResponses.map(r => r.metrics.creativity_score))}%
                  </div>
                  <div className="text-sm text-gray-600">Most Creative</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-amber-600">
                    ${Math.min(...selectedResponses.map(r => r.cost)).toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">Lowest Cost</div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return <div>Other view modes coming soon...</div>;
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
                    <option value="search-and-select">Search & Select</option>
                    <option value="detailed-comparison">Detailed Comparison</option>
                    <option value="analytics-dashboard">Analytics Dashboard</option>
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

        {viewMode === 'analytics-dashboard' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-6">Advanced analytics and insights coming soon...</p>
            <button
              onClick={() => setViewMode('search-and-select')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseComparison;
                  >
                    <option value="enhanced-side-by-side">Enhanced Side-by-Side</option>
                    <option value="metrics-dashboard">Metrics Dashboard</option>
                    <option value="detailed-analysis">Detailed Analysis</option>
                    <option value="heatmap-view">Heatmap View</option>
                  </select>
                  <select
                    value={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.value)}
                    className="px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-gray-700 font-medium shadow-lg"
                  >
                    <option value="comprehensive">Comprehensive</option>
                    <option value="metrics-only">Metrics Only</option>
                    <option value="content-only">Content Only</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>New Comparison</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-8">
            {[
              { id: 'library', label: 'Response Library', icon: DocumentTextIcon },
              { id: 'comparison', label: 'Active Comparison', icon: ArrowsRightLeftIcon },
              { id: 'analytics', label: 'Advanced Analytics', icon: ChartBarIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.id === 'comparison' && selectedResponses.length > 0 && (
                  <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                    {selectedResponses.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'library' && (
          <div className="space-y-8">
            {/* Enhanced Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search responses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-lg"
                    />
                  </div>
                  <select
                    value={filterCriteria.model}
                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, model: e.target.value }))}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-lg"
                  >
                    <option value="all">All Models</option>
                    <option value="GPT-4">GPT-4</option>
                    <option value="Claude-3">Claude-3</option>
                    <option value="Gemini-Pro">Gemini-Pro</option>
                    <option value="GPT-3.5">GPT-3.5</option>
                  </select>
                  <select
                    value={filterCriteria.sortBy}
                    onChange={(e) => setFilterCriteria(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-lg"
                  >
                    <option value="quality">Sort by Quality</option>
                    <option value="time">Sort by Speed</option>
                    <option value="cost">Sort by Cost</option>
                    <option value="creativity">Sort by Creativity</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilterCriteria(prev => ({ ...prev, showFavorites: !prev.showFavorites }))}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg ${
                        filterCriteria.showFavorites
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-white/90 text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <HeartIcon className="w-4 h-4 mr-2 inline" />
                      Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredResponses.map((response, index) => (
                <EnhancedResponseCard 
                  key={response.id} 
                  response={response} 
                  index={index}
                  isSelected={selectedResponses.some(r => r.id === response.id)}
                  showAddButton={true}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {selectedResponses.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-purple-300 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <ArrowsRightLeftIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Ready to Compare Responses
                </h3>
                <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                  Select up to 6 responses from the library to start a comprehensive comparison with advanced analytics.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Detailed Metrics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BeakerIcon className="w-5 h-5" />
                    <span>Parameter Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5" />
                    <span>Model Comparison</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Enhanced Action Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Advanced Response Analysis
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Comparing {selectedResponses.length} response{selectedResponses.length !== 1 ? 's' : ''} with comprehensive analytics and insights
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={clearComparison}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                        <ShareIcon className="w-4 h-4" />
                        <span>Export Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Response Cards Grid */}
                <div className={`grid gap-8 ${
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

                {/* Comprehensive Analytics Section */}
                {selectedResponses.length > 1 && <ComparisonAnalytics responses={selectedResponses} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {selectedResponses.length < 2 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Select at least 2 responses to view advanced analytics and insights.</p>
              </div>
            ) : (
              <ComparisonAnalytics responses={selectedResponses} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseComparison;
