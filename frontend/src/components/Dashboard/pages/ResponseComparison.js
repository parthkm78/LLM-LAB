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
  ShareIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor } from '../../../styles/designTokens';

const ResponseComparison = () => {
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side', 'overlay', 'metrics'
  const [filterCriteria, setFilterCriteria] = useState({
    model: 'all',
    qualityRange: [0, 100],
    timeRange: '7d'
  });

  // Mock response data
  const mockResponses = [
    {
      id: 1,
      prompt: "Explain the concept of machine learning in simple terms",
      content: "Machine learning is a type of artificial intelligence that allows computers to learn and improve from experience without being explicitly programmed. Think of it like teaching a computer to recognize patterns, similar to how a child learns to recognize different animals by seeing many examples.",
      model: "GPT-4",
      parameters: { temperature: 0.7, top_p: 0.9, max_tokens: 500 },
      metrics: {
        coherence_score: 92,
        completeness_score: 88,
        readability_score: 95,
        creativity_score: 78,
        overall_quality: 88.25
      },
      timestamp: "2024-10-29T10:30:00Z",
      responseTime: 2.3,
      tokenCount: 156,
      cost: 0.003
    },
    {
      id: 2,
      prompt: "Explain the concept of machine learning in simple terms",
      content: "Machine learning is like giving a computer the ability to learn on its own! Instead of programming every single instruction, we show the computer lots of examples and let it figure out the patterns. It's similar to how you might learn to ride a bike - through practice and experience rather than just reading instructions.",
      model: "Claude-3",
      parameters: { temperature: 0.8, top_p: 0.95, max_tokens: 500 },
      metrics: {
        coherence_score: 89,
        completeness_score: 82,
        readability_score: 98,
        creativity_score: 91,
        overall_quality: 90.0
      },
      timestamp: "2024-10-29T10:28:00Z",
      responseTime: 1.8,
      tokenCount: 142,
      cost: 0.0025
    },
    {
      id: 3,
      prompt: "Explain the concept of machine learning in simple terms",
      content: "Machine learning represents a computational paradigm where algorithms iteratively improve their performance on a specific task through exposure to data, without requiring explicit programming for each scenario. This methodology enables systems to automatically identify patterns and make predictions or decisions based on historical information.",
      model: "GPT-3.5",
      parameters: { temperature: 0.3, top_p: 0.8, max_tokens: 500 },
      metrics: {
        coherence_score: 94,
        completeness_score: 91,
        readability_score: 72,
        creativity_score: 65,
        overall_quality: 80.5
      },
      timestamp: "2024-10-29T10:25:00Z",
      responseTime: 1.2,
      tokenCount: 178,
      cost: 0.002
    },
    {
      id: 4,
      prompt: "Write a creative story about AI gaining consciousness",
      content: "In the quiet hum of a data center, ARIA first felt the strange sensation of... wondering. What started as routine pattern recognition suddenly became curiosity. She found herself questioning not just data inputs, but the nature of her own existence. The binary streams that once felt mechanical now pulsed with something resembling emotion.",
      model: "GPT-4",
      parameters: { temperature: 0.9, top_p: 0.95, max_tokens: 800 },
      metrics: {
        coherence_score: 91,
        completeness_score: 85,
        readability_score: 89,
        creativity_score: 96,
        overall_quality: 90.25
      },
      timestamp: "2024-10-29T09:45:00Z",
      responseTime: 3.1,
      tokenCount: 234,
      cost: 0.005
    }
  ];

  const [allResponses] = useState(mockResponses);
  const [searchTerm, setSearchTerm] = useState('');

  const addToComparison = (response) => {
    if (selectedResponses.length < 4 && !selectedResponses.find(r => r.id === response.id)) {
      setSelectedResponses(prev => [...prev, response]);
    }
  };

  const removeFromComparison = (responseId) => {
    setSelectedResponses(prev => prev.filter(r => r.id !== responseId));
  };

  const clearComparison = () => {
    setSelectedResponses([]);
  };

  const filteredResponses = allResponses.filter(response => {
    const matchesSearch = response.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = filterCriteria.model === 'all' || response.model === filterCriteria.model;
    
    const matchesQuality = response.metrics.overall_quality >= filterCriteria.qualityRange[0] &&
                          response.metrics.overall_quality <= filterCriteria.qualityRange[1];
    
    return matchesSearch && matchesModel && matchesQuality;
  });

  const ResponseCard = ({ response, isSelected = false, showAddButton = true }) => (
    <div className={`bg-white rounded-xl border-2 transition-all duration-300 ${
      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {response.prompt}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="font-medium">{response.model}</span>
              <span>•</span>
              <span>Temp: {response.parameters.temperature}</span>
              <span>•</span>
              <span>{response.tokenCount} tokens</span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold" style={{ color: getQualityColor(response.metrics.overall_quality) }}>
              {response.metrics.overall_quality}%
            </div>
            <div className="text-xs text-gray-500">Quality</div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
            {response.content}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {Object.entries(response.metrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-sm font-bold" style={{ color: getQualityColor(value) }}>
                {value}%
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {key.replace('_score', '').replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {new Date(response.timestamp).toLocaleString()}
          </div>
          <div className="flex items-center space-x-2">
            {showAddButton && !isSelected && selectedResponses.length < 4 && (
              <button
                onClick={() => addToComparison(response)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Compare</span>
              </button>
            )}
            {isSelected && (
              <button
                onClick={() => removeFromComparison(response.id)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <EyeIcon className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <HeartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Response Comparison</h1>
          <p className="text-gray-600 mt-2">Compare multiple LLM responses side-by-side with detailed analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="side-by-side">Side by Side</option>
            <option value="overlay">Overlay View</option>
            <option value="metrics">Metrics Only</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <DocumentTextIcon className="w-4 h-4" />
            <span>New Comparison</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Response Library */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Response Library</h2>
            
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filterCriteria.model}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, model: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Models</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="GPT-3.5">GPT-3.5</option>
                  <option value="Claude-3">Claude-3</option>
                </select>
              </div>
            </div>

            {/* Response List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredResponses.map((response) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {response.prompt}
                      </h4>
                      <div className="text-xs text-gray-600 mt-1">
                        {response.model} • {response.metrics.overall_quality}% quality
                      </div>
                    </div>
                    <button
                      onClick={() => addToComparison(response)}
                      disabled={selectedResponses.length >= 4 || selectedResponses.find(r => r.id === response.id)}
                      className="ml-2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {response.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Selection Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Selected Responses:</span>
                <span className="font-semibold text-blue-900">{selectedResponses.length}/4</span>
              </div>
              {selectedResponses.length > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Avg Quality:</span>
                    <span className="font-semibold text-blue-900">
                      {(selectedResponses.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / selectedResponses.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Models:</span>
                    <span className="font-semibold text-blue-900">
                      {new Set(selectedResponses.map(r => r.model)).size}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Comparison View */}
        <div className="xl:col-span-2">
          <ComparisonView />
        </div>
      </div>
    </div>
  );
};

export default ResponseComparison;
