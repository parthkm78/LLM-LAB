import React, { useState } from 'react';
import { 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrashIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  StarIcon,
  ArchiveBoxIcon,
  TagIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  BeakerIcon,
  SquaresPlusIcon,
  TrophyIcon,
  FolderIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { designTokens, getQualityColor } from '../../../styles/designTokens';

const ExperimentHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'timeline'
  const [selectedExperiments, setSelectedExperiments] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Mock experiment history data
  const experiments = [
    {
      id: 'exp_001',
      name: 'Response Quality  Optimization',
      type: 'single',
      model: 'GPT-4',
      prompt: 'Write a compelling short story about AI discovering emotions...',
      quality: 94.2,
      creativity: 97,
      coherence: 92,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed',
      tags: ['creative', 'storytelling', 'high-quality'],
      favorited: true,
      parameters: { temperature: 0.8, top_p: 0.9, max_tokens: 400 },
      cost: 0.023,
      duration: '3.2s',
      archived: false
    },
    {
      id: 'batch_001',
      name: 'Parameter Sweep - Technical Writing',
      type: 'batch',
      model: 'GPT-4',
      prompt: 'Explain quantum computing concepts for beginners...',
      quality: 86.7,
      combinations: 120,
      bestQuality: 94.2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'completed',
      tags: ['technical', 'education', 'parameter-sweep'],
      favorited: false,
      totalCost: 0.542,
      duration: '1h 30m',
      archived: false
    },
    {
      id: 'exp_002',
      name: 'Product Description Generator',
      type: 'single',
      model: 'GPT-3.5-turbo',
      prompt: 'Generate compelling product descriptions for e-commerce...',
      quality: 78.5,
      creativity: 82,
      coherence: 88,
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: 'completed',
      tags: ['commercial', 'marketing', 'conversion'],
      favorited: false,
      parameters: { temperature: 0.7, top_p: 0.8, max_tokens: 200 },
      cost: 0.012,
      duration: '2.1s',
      archived: false
    },
    {
      id: 'exp_003',
      name: 'Code Documentation Assistant',
      type: 'single',
      model: 'GPT-4',
      prompt: 'Generate comprehensive code documentation...',
      quality: 91.3,
      creativity: 75,
      coherence: 95,
      date: new Date(Date.now() - 1000 * 60 * 60 * 72),
      status: 'failed',
      tags: ['technical', 'documentation', 'development'],
      favorited: false,
      parameters: { temperature: 0.3, top_p: 0.7, max_tokens: 500 },
      cost: 0.019,
      duration: '4.1s',
      archived: false,
      error: 'Token limit exceeded'
    },
    {
      id: 'batch_002',
      name: 'Multi-Model Comparison',
      type: 'batch',
      model: 'Multiple',
      prompt: 'Compare response quality across different models...',
      quality: 83.2,
      combinations: 45,
      bestQuality: 89.7,
      date: new Date(Date.now() - 1000 * 60 * 60 * 96),
      status: 'completed',
      tags: ['comparison', 'analysis', 'multi-model'],
      favorited: true,
      totalCost: 0.234,
      duration: '45m',
      archived: true
    }
  ];

  // Filter and sort experiments
  const filteredExperiments = experiments
    .filter(exp => {
      // Search filter
      if (searchQuery && !exp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }

      // Status filter
      switch (selectedFilter) {
        case 'completed': return exp.status === 'completed';
        case 'failed': return exp.status === 'failed';
        case 'favorited': return exp.favorited;
        case 'high_quality': return exp.quality >= 90;
        case 'single': return exp.type === 'single';
        case 'batch': return exp.type === 'batch';
        case 'archived': return exp.archived;
        case 'active': return !exp.archived;
        default: return true;
      }
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'quality':
          comparison = a.quality - b.quality;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'cost':
          const aCost = a.cost || a.totalCost || 0;
          const bCost = b.cost || b.totalCost || 0;
          comparison = aCost - bCost;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Group experiments by date
  const groupedExperiments = filteredExperiments.reduce((groups, exp) => {
    const date = exp.date.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(exp);
    return groups;
  }, {});

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleFavorite = (id) => {
    // In real app, would update the experiment
    console.log(`Toggle favorite for experiment ${id}`);
  };

  const toggleArchive = (id) => {
    // In real app, would update the experiment
    console.log(`Toggle archive for experiment ${id}`);
  };

  const deleteExperiment = (id) => {
    // In real app, would delete the experiment
    console.log(`Delete experiment ${id}`);
  };

  const toggleExperimentSelection = (id) => {
    setSelectedExperiments(prev => 
      prev.includes(id) 
        ? prev.filter(expId => expId !== id)
        : [...prev, id]
    );
  };

  const toggleGroupExpansion = (date) => {
    setExpandedGroups(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const ExperimentCard = ({ experiment, showDate = false }) => (
    <div className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
      selectedExperiments.includes(experiment.id) 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-blue-300'
    } ${experiment.archived ? 'opacity-60' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={selectedExperiments.includes(experiment.id)}
              onChange={() => toggleExperimentSelection(experiment.id)}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
                {experiment.type === 'batch' && (
                  <SquaresPlusIcon className="w-4 h-4 text-purple-500" />
                )}
                {experiment.favorited && (
                  <StarIconSolid className="w-4 h-4 text-yellow-500" />
                )}
                {experiment.archived && (
                  <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{experiment.model}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  experiment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  experiment.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {experiment.status}
                </span>
                {showDate && (
                  <>
                    <span>•</span>
                    <span>{experiment.date.toLocaleDateString()}</span>
                  </>
                )}
              </div>

              {experiment.error && (
                <div className="flex items-center space-x-2 mt-2 text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">{experiment.error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: getQualityColor(experiment.quality) }}>
              {experiment.quality}%
            </div>
            <div className="text-xs text-gray-500">
              {experiment.type === 'batch' ? 'Avg Quality' : 'Quality'}
            </div>
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 truncate">{experiment.prompt}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {experiment.type === 'single' ? (
            <>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: getQualityColor(experiment.creativity) }}>
                  {Math.round(experiment.creativity)}%
                </div>
                <div className="text-xs text-gray-500">Creativity</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: getQualityColor(experiment.coherence) }}>
                  {Math.round(experiment.coherence)}%
                </div>
                <div className="text-xs text-gray-500">Coherence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  ${experiment.cost.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Cost</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {experiment.combinations}
                </div>
                <div className="text-xs text-gray-500">Combinations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: getQualityColor(experiment.bestQuality) }}>
                  {experiment.bestQuality}%
                </div>
                <div className="text-xs text-gray-500">Best Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  ${experiment.totalCost.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Total Cost</div>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {experiment.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(experiment.id)}
              className={`p-2 rounded-lg transition-colors ${
                experiment.favorited 
                  ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' 
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              <StarIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => toggleArchive(experiment.id)}
              className={`p-2 rounded-lg transition-colors ${
                experiment.archived 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-100'
              }`}
            >
              <ArchiveBoxIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => deleteExperiment(experiment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
              <EyeIcon className="w-4 h-4" />
              <span>View</span>
            </button>
            
            {experiment.type === 'batch' && (
              <button className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm">
                <ChartBarIcon className="w-4 h-4" />
                <span>Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Experiment History</h1>
            <p className="text-gray-600 text-sm">Manage and analyze your LLM experiments</p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="list">List View</option>
              <option value="grid">Grid View</option>
              <option value="timeline">Timeline View</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Experiments</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="favorited">Favorited</option>
                <option value="high_quality">High Quality (90%+)</option>
                <option value="single">Single Experiments</option>
                <option value="batch">Batch Experiments</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="quality">Sort by Quality</option>
                <option value="name">Sort by Name</option>
                <option value="cost">Sort by Cost</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'desc' ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronUpIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedExperiments.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedExperiments.length} selected
                </span>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Compare
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredExperiments.length} of {experiments.length} experiments
          </div>
          
          {selectedExperiments.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm">
                <ArrowsRightLeftIcon className="w-4 h-4" />
                <span>Compare Selected</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <ArchiveBoxIcon className="w-4 h-4" />
                <span>Archive Selected</span>
              </button>
            </div>
          )}
        </div>

        {/* Experiments Display */}
        {viewMode === 'timeline' ? (
          /* Timeline View - Grouped by Date */
          <div className="space-y-6">
            {Object.entries(groupedExperiments).map(([date, dateExperiments]) => (
              <div key={date} className="bg-white rounded-xl border border-gray-200">
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleGroupExpansion(date)}
                >
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{date}</h3>
                    <span className="text-sm text-gray-500">({dateExperiments.length} experiments)</span>
                  </div>
                  {expandedGroups[date] ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                {(expandedGroups[date] !== false) && (
                  <div className="p-4 space-y-4">
                    {dateExperiments.map(experiment => (
                      <ExperimentCard key={experiment.id} experiment={experiment} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} showDate={true} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredExperiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} showDate={true} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredExperiments.length === 0 && (
          <div className="text-center py-12">
            <BeakerIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No experiments found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by creating your first experiment'}
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create New Experiment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentHistory;
