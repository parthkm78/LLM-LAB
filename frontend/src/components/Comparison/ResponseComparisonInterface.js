import React, { useState, useMemo } from 'react';
import { 
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  StarIcon,
  FireIcon,
  BeakerIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor, getParameterColor } from '../../styles/designTokens';
import { MetricCard } from '../Metrics/MetricCards';

const ResponseComparisonInterface = ({ 
  responses = [], 
  onResponseSelect,
  selectedResponses = [],
  showMetrics = true 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'side-by-side', 'detailed'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'best', 'worst', 'temperature', 'top_p'
  const [sortBy, setSortBy] = useState('quality'); // 'quality', 'temperature', 'top_p', 'created_at'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('overall_quality');

  // Filter and sort responses
  const filteredAndSortedResponses = useMemo(() => {
    let filtered = responses;

    // Apply filters
    if (filterBy === 'best') {
      const avgQuality = responses.reduce((sum, r) => sum + (r.metrics?.overall_quality || 0), 0) / responses.length;
      filtered = responses.filter(r => (r.metrics?.overall_quality || 0) >= avgQuality);
    } else if (filterBy === 'worst') {
      const avgQuality = responses.reduce((sum, r) => sum + (r.metrics?.overall_quality || 0), 0) / responses.length;
      filtered = responses.filter(r => (r.metrics?.overall_quality || 0) < avgQuality);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.parameters?.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort responses
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return (b.metrics?.overall_quality || 0) - (a.metrics?.overall_quality || 0);
        case 'temperature':
          return (b.parameters?.temperature || 0) - (a.parameters?.temperature || 0);
        case 'top_p':
          return (b.parameters?.top_p || 0) - (a.parameters?.top_p || 0);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });
  }, [responses, filterBy, sortBy, searchTerm]);

  // Get quality score for a response
  const getResponseQuality = (response) => {
    return response.metrics?.overall_quality || 
           ((response.metrics?.coherence_score || 0) + 
            (response.metrics?.completeness_score || 0) + 
            (response.metrics?.readability_score || 0)) / 3;
  };

  // Response card component
  const ResponseCard = ({ response, isSelected, onSelect, isCompact = false }) => {
    const quality = getResponseQuality(response);
    const qualityColor = getQualityColor(quality);

    return (
      <div 
        className={`
          relative bg-white/90 backdrop-blur-sm rounded-xl border-2 transition-all duration-200 cursor-pointer
          hover:shadow-lg group
          ${isSelected 
            ? 'border-primary-500 shadow-lg ring-2 ring-primary-500/20' 
            : 'border-neutral-200 hover:border-neutral-300'
          }
        `}
        onClick={() => onSelect(response)}
      >
        {/* Header with parameters */}
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span 
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getParameterColor('temperature') }}
                >
                  T: {response.parameters?.temperature || 0.7}
                </span>
                <span 
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getParameterColor('top_p') }}
                >
                  P: {response.parameters?.top_p || 0.9}
                </span>
              </div>
              {isSelected && (
                <StarIcon className="h-4 w-4 text-primary-500 fill-current" />
              )}
            </div>
            
            <div className="text-right">
              <div 
                className="text-lg font-bold"
                style={{ color: qualityColor }}
              >
                {quality.toFixed(0)}%
              </div>
              <div className="text-xs text-neutral-500">Quality</div>
            </div>
          </div>

          {/* Quality metrics preview */}
          {!isCompact && response.metrics && (
            <div className="flex gap-2">
              {['coherence_score', 'completeness_score', 'readability_score'].map(metric => (
                <div key={metric} className="flex-1">
                  <div className="text-xs text-neutral-500 capitalize">
                    {metric.split('_')[0]}
                  </div>
                  <div className="h-1 bg-neutral-100 rounded-full mt-1">
                    <div 
                      className="h-1 rounded-full"
                      style={{ 
                        width: `${response.metrics[metric] || 0}%`,
                        backgroundColor: getQualityColor(response.metrics[metric] || 0)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response content */}
        <div className="p-4">
          <div className={`text-sm text-neutral-700 ${isCompact ? 'line-clamp-3' : 'line-clamp-6'}`}>
            {response.content}
          </div>
          
          {!isCompact && (
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>{response.usage?.total_tokens || 0} tokens</span>
              <span>{response.response_time || 0}ms</span>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{selectedResponses.indexOf(response) + 1}</span>
          </div>
        )}
      </div>
    );
  };

  // Side-by-side comparison view
  const SideBySideView = () => {
    if (selectedResponses.length < 2) {
      return (
        <div className="text-center py-12">
          <DocumentDuplicateIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Select responses to compare</h3>
          <p className="text-neutral-500">Choose 2-4 responses to see detailed comparison</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {selectedResponses.slice(0, 3).map((response, index) => (
          <div key={response.id} className="space-y-4">
            <ResponseCard 
              response={response} 
              isSelected={true}
              onSelect={() => {}}
            />
            
            {/* Detailed metrics */}
            {showMetrics && response.metrics && (
              <div className="space-y-3">
                <MetricCard
                  title="Quality Breakdown"
                  value={getResponseQuality(response)}
                  breakdown={response.metrics}
                  isCompact={true}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200/50 shadow-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Responses</option>
            <option value="best">Best Quality</option>
            <option value="worst">Needs Improvement</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="quality">Sort by Quality</option>
            <option value="temperature">Sort by Temperature</option>
            <option value="top_p">Sort by Top-p</option>
            <option value="created_at">Sort by Date</option>
          </select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'side-by-side' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Compare
            </button>
          </div>
        </div>

        {/* Selection summary */}
        {selectedResponses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                {selectedResponses.length} response{selectedResponses.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => onResponseSelect([])}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'side-by-side' ? (
        <SideBySideView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedResponses.map(response => (
            <ResponseCard
              key={response.id}
              response={response}
              isSelected={selectedResponses.some(r => r.id === response.id)}
              onSelect={(resp) => {
                const isSelected = selectedResponses.some(r => r.id === resp.id);
                if (isSelected) {
                  onResponseSelect(selectedResponses.filter(r => r.id !== resp.id));
                } else {
                  onResponseSelect([...selectedResponses, resp]);
                }
              }}
              isCompact={viewMode === 'grid'}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredAndSortedResponses.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No responses found</h3>
          <p className="text-neutral-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Run an experiment to see responses here'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponseComparisonInterface;
