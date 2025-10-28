import React from 'react';

const ResponseCard = ({ response, metrics, onSelect, isSelected, onCompare }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score) => {
    return typeof score === 'number' ? (score * 100).toFixed(1) : 'N/A';
  };

  return (
    <div className={`bg-white border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Response #{response.id}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>T: {response.temperature}</span>
            <span>•</span>
            <span>P: {response.top_p}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect(response.id)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          <button
            onClick={() => onCompare(response.id)}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.coherence)}`}>
              {formatScore(metrics.coherence)}%
            </div>
            <div className="text-xs text-gray-500">Coherence</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.completeness)}`}>
              {formatScore(metrics.completeness)}%
            </div>
            <div className="text-xs text-gray-500">Completeness</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.readability)}`}>
              {formatScore(metrics.readability)}%
            </div>
            <div className="text-xs text-gray-500">Readability</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getScoreColor(metrics.length_appropriateness)}`}>
              {formatScore(metrics.length_appropriateness)}%
            </div>
            <div className="text-xs text-gray-500">Length</div>
          </div>
        </div>
      )}

      {/* Response Text */}
      <div className="bg-gray-50 rounded-md p-4">
        <div className="text-sm text-gray-700 line-clamp-4">
          {response.text}
        </div>
        {response.text && response.text.length > 200 && (
          <button className="text-blue-600 hover:text-blue-800 text-sm mt-2 font-medium">
            Read more...
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Generated: {new Date(response.created_at).toLocaleString()}</span>
        <span>Tokens: {response.token_count || 'N/A'}</span>
      </div>
    </div>
  );
};

export default ResponseCard;
