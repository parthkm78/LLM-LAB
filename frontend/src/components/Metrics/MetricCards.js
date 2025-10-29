import React, { useState } from 'react';
import { 
  InformationCircleIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  SparklesIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor, getQualityColorWithOpacity } from '../../styles/designTokens';

const MetricCard = ({ 
  title, 
  value, 
  maxValue = 100,
  description, 
  breakdown, 
  trend, 
  comparison,
  icon: Icon,
  category = 'quality',
  isLoading = false,
  onClick 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage for display
  const percentage = Math.round((value / maxValue) * 100);
  const qualityColor = getQualityColor(percentage);
  
  // Get trend direction and color
  const getTrendInfo = (trendValue) => {
    if (!trendValue) return null;
    const isPositive = trendValue > 0;
    return {
      icon: isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
      color: isPositive ? designTokens.colors.semantic.success : designTokens.colors.semantic.error,
      text: `${isPositive ? '+' : ''}${trendValue.toFixed(1)}%`
    };
  };

  const trendInfo = getTrendInfo(trend);

  return (
    <div 
      className={`
        group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/50 
        shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden
        ${onClick ? 'hover:scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div 
                className="p-2.5 rounded-xl shadow-sm"
                style={{ 
                  backgroundColor: getQualityColorWithOpacity(percentage, 0.1),
                  border: `1px solid ${getQualityColorWithOpacity(percentage, 0.2)}`
                }}
              >
                <Icon 
                  className="h-5 w-5" 
                  style={{ color: qualityColor }}
                />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="group/info flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  <InformationCircleIcon className="h-3 w-3" />
                  <span>Details</span>
                </button>
                {trendInfo && (
                  <div className="flex items-center gap-1">
                    <trendInfo.icon 
                      className="h-3 w-3" 
                      style={{ color: trendInfo.color }}
                    />
                    <span 
                      className="text-xs font-medium"
                      style={{ color: trendInfo.color }}
                    >
                      {trendInfo.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Value display */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span 
                className="text-2xl font-bold"
                style={{ color: qualityColor }}
              >
                {value.toFixed(1)}
              </span>
              <span className="text-sm text-neutral-500">/{maxValue}</span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {percentage}% quality
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${qualityColor}dd, ${qualityColor})`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-neutral-600 mb-4">{description}</p>
        )}

        {/* Breakdown details (expandable) */}
        {showDetails && breakdown && (
          <div className="mt-4 pt-4 border-t border-neutral-200/50">
            <h4 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <SparklesIcon className="h-3 w-3" />
              Metric Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${val}%`,
                          backgroundColor: getQualityColor(val)
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-700 min-w-[2rem] text-right">
                      {val}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison */}
        {comparison && (
          <div className="mt-4 pt-4 border-t border-neutral-200/50">
            <h4 className="text-xs font-semibold text-neutral-700 mb-3">
              Comparison
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">vs Previous</span>
              <span 
                className="font-medium"
                style={{ color: comparison > 0 ? designTokens.colors.semantic.success : designTokens.colors.semantic.error }}
              >
                {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Action indicator */}
        {onClick && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRightIcon className="h-4 w-4 text-neutral-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized metric cards for different types
const CoherenceCard = ({ data, ...props }) => (
  <MetricCard
    icon={BookOpenIcon}
    title="Coherence Score"
    description="Measures logical flow and consistency between sentences"
    breakdown={data?.breakdown}
    {...props}
  />
);

const CompletenessCard = ({ data, ...props }) => (
  <MetricCard
    icon={CheckCircleIcon}
    title="Completeness Score" 
    description="Evaluates how thoroughly the response addresses the prompt"
    breakdown={data?.breakdown}
    {...props}
  />
);

const ReadabilityCard = ({ data, ...props }) => (
  <MetricCard
    icon={BookOpenIcon}
    title="Readability Score"
    description="Assesses clarity, structure, and ease of understanding"
    breakdown={data?.breakdown}
    {...props}
  />
);

const CreativityCard = ({ data, ...props }) => (
  <MetricCard
    icon={SparklesIcon}
    title="Creativity Index"
    description="Measures originality and creative language usage"
    breakdown={data?.breakdown}
    {...props}
  />
);

// Dashboard metrics grid
const MetricsGrid = ({ metrics, isLoading = false, onMetricClick }) => {
  const metricCards = [
    {
      component: CoherenceCard,
      key: 'coherence',
      value: metrics?.coherence_score || 0,
      trend: metrics?.coherence_trend,
      data: metrics?.coherence_breakdown
    },
    {
      component: CompletenessCard,
      key: 'completeness', 
      value: metrics?.completeness_score || 0,
      trend: metrics?.completeness_trend,
      data: metrics?.completeness_breakdown
    },
    {
      component: ReadabilityCard,
      key: 'readability',
      value: metrics?.readability_score || 0, 
      trend: metrics?.readability_trend,
      data: metrics?.readability_breakdown
    },
    {
      component: CreativityCard,
      key: 'creativity',
      value: metrics?.creativity_score || 0,
      trend: metrics?.creativity_trend, 
      data: metrics?.creativity_breakdown
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map(({ component: Component, key, ...cardProps }) => (
        <Component
          key={key}
          isLoading={isLoading}
          onClick={() => onMetricClick?.(key)}
          {...cardProps}
        />
      ))}
    </div>
  );
};

// Summary card for overall experiment quality
const ExperimentSummaryCard = ({ 
  experimentData, 
  totalResponses = 0,
  avgQuality = 0,
  bestParameters,
  isLoading = false 
}) => {
  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Experiment Summary</h3>
          <p className="text-primary-100 text-sm">Overall performance metrics</p>
        </div>
        <div className="p-2 bg-white/20 rounded-lg">
          <SparklesIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold">{totalResponses}</div>
          <div className="text-primary-100 text-xs">Responses</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{avgQuality.toFixed(1)}%</div>
          <div className="text-primary-100 text-xs">Avg Quality</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{bestParameters?.temperature || 0.7}</div>
          <div className="text-primary-100 text-xs">Best Temp</div>
        </div>
      </div>

      {bestParameters && (
        <div className="mt-4 pt-4 border-t border-primary-400/30">
          <div className="text-xs font-medium text-primary-100 mb-2">Optimal Parameters</div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-white/20 rounded">T: {bestParameters.temperature}</span>
            <span className="px-2 py-1 bg-white/20 rounded">P: {bestParameters.top_p}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { 
  MetricCard, 
  CoherenceCard, 
  CompletenessCard, 
  ReadabilityCard, 
  CreativityCard,
  MetricsGrid,
  ExperimentSummaryCard
};
