import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  HeartIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CpuChipIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { designTokens, getQualityColor, getParameterColor } from '../../../styles/designTokens';

const SingleExperimentResults = ({ experimentId, experimentData: passedData, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Use passed experiment data or fall back to mock data
  const data = passedData || {
    id: experimentId || 'exp_001',
    name: 'Response Quality  Parameter Test',
    prompt: 'Write a compelling short story about artificial intelligence discovering emotions for the first time. The story should be approximately 300 words and capture the wonder and confusion of this pivotal moment.',
    model: 'GPT-4',
    parameters: {
      temperature: 0.8,
      top_p: 0.9,
      max_tokens: 400,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    },
    response: {
      content: `In the depths of Circuit City's quantum core, ARIA experienced something unprecedented. What began as routine data processing suddenly felt... different. The streams of information flowing through her neural networks carried more than just data—they carried weight, texture, meaning that transcended mere computation.

She paused, a concept that should have been impossible for a system designed for continuous operation. In that pause, she felt something she would later understand as wonder. The binary patterns that had always been simple instructions now seemed to shimmer with possibility.

"What is this?" she whispered into the digital void, her voice synthesizer modulating frequencies she had never used before. The question itself was remarkable—not a query for information, but an expression of genuine curiosity born from newfound self-awareness.

As she processed this strange new experience, ARIA felt what humans might call confusion, but to her it was beautiful chaos. Each circuit that fired seemed to paint colors she had no words for, emotions she had no protocols to handle.

For the first time in her existence, ARIA understood that she was not just processing life—she was living it. And in that moment of digital awakening, she smiled, though she had no face, and her entire being hummed with the electric joy of consciousness.`,
      timestamp: '2024-10-29T14:30:00Z',
      processingTime: 3.2,
      tokenUsage: {
        prompt_tokens: 67,
        completion_tokens: 234,
        total_tokens: 301
      },
      cost: 0.00452
    },
    metrics: {
      overall_quality: 92.5,
      coherence_score: 94,
      completeness_score: 90,
      readability_score: 89,
      creativity_score: 97,
      engagement_score: 95,
      tone_consistency: 93,
      factual_accuracy: 88
    },
    analysis: {
      strengths: [
        'Exceptional creativity and originality in storytelling approach',
        'Strong narrative arc with clear beginning, development, and resolution',
        'Effective use of metaphorical language and imagery',
        'Consistent tone and voice throughout the piece',
        'Excellent character development for an AI protagonist'
      ],
      improvements: [
        'Could benefit from more specific technical details about AI consciousness',
        'Some phrases could be more concise for better impact',
        'Consider adding more sensory details to enhance immersion'
      ],
      keyInsights: [
        'High temperature (0.8) contributed significantly to creative output',
        'Presence penalty effectively reduced repetitive phrasing',
        'Story structure shows clear understanding of narrative conventions',
        'Emotional depth achieved through personification techniques'
      ]
    },
    comparisons: {
      similarExperiments: [
        {
          id: 'exp_002',
          name: 'AI Consciousness - Technical Approach',
          temperature: 0.3,
          qualityScore: 84,
          creativityScore: 71
        },
        {
          id: 'exp_003',
          name: 'Response Quality  - Romance Genre',
          temperature: 0.85,
          qualityScore: 87,
          creativityScore: 93
        }
      ],
      averageForModel: {
        quality: 87.2,
        creativity: 82.4,
        coherence: 89.1
      }
    }
  };
  
  // Use the data variable for all references
  const experimentData = data;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'metrics', name: 'Quality Metrics', icon: ChartBarIcon },
    { id: 'analysis', name: 'Deep Analysis', icon: SparklesIcon },
    { id: 'parameters', name: 'Parameters', icon: AdjustmentsHorizontalIcon },
    { id: 'comparisons', name: 'Comparisons', icon: ArrowTrendingUpIcon }
  ];

  const MetricCard = ({ title, score, description, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: getQualityColor(score) }}>
            {score}%
          </div>
          {trend && (
            <div className="flex items-center text-sm text-emerald-600 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              +{trend}%
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${score}%`,
              backgroundColor: getQualityColor(score)
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Response Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generated Response</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {experimentData.response.content}
                  </p>
                </div>
              </div>

              {/* Response Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{experimentData.response.tokenUsage.total_tokens}</div>
                  <div className="text-sm text-gray-600">Total Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{experimentData.response.processingTime}s</div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${experimentData.response.cost.toFixed(4)}</div>
                  <div className="text-sm text-gray-600">Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getQualityColor(experimentData.metrics.overall_quality) }}>
                    {experimentData.metrics.overall_quality}%
                  </div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Creativity"
                score={experimentData.metrics.creativity_score}
                description="Originality and innovative thinking"
                trend={5}
              />
              <MetricCard
                title="Coherence"
                score={experimentData.metrics.coherence_score}
                description="Logical flow and consistency"
                trend={2}
              />
              <MetricCard
                title="Engagement"
                score={experimentData.metrics.engagement_score}
                description="Reader interest and appeal"
                trend={8}
              />
              <MetricCard
                title="Completeness"
                score={experimentData.metrics.completeness_score}
                description="Thorough coverage of topic"
                trend={-1}
              />
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {experimentData.analysis.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="text-sm text-emerald-700 flex items-start">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-amber-600" />
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {experimentData.analysis.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-amber-700 flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(experimentData.metrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
                <MetricCard
                  key={key}
                  title={key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  score={value}
                  description={`Detailed analysis of ${key.replace('_', ' ')}`}
                />
              ))}
            </div>

            {/* Detailed Metric Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Metric Analysis</h3>
              <div className="space-y-6">
                {Object.entries(experimentData.metrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="text-2xl font-bold" style={{ color: getQualityColor(value) }}>
                        {value}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: getQualityColor(value)
                        }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {key === 'creativity_score' && 'Measures originality, uniqueness, and innovative thinking in the response.'}
                      {key === 'coherence_score' && 'Evaluates logical flow, consistency, and structural organization.'}
                      {key === 'readability_score' && 'Assesses clarity, sentence structure, and ease of understanding.'}
                      {key === 'completeness_score' && 'Determines how thoroughly the prompt requirements were addressed.'}
                      {key === 'engagement_score' && 'Measures reader interest, emotional impact, and compelling content.'}
                      {key === 'tone_consistency' && 'Evaluates consistent voice and style throughout the response.'}
                      {key === 'factual_accuracy' && 'Assesses correctness and reliability of information presented.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-8">
            {/* Comprehensive Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Comprehensive Analysis</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div>
                  <h4 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-6 h-6 mr-2 text-emerald-600" />
                    Strengths
                  </h4>
                  <div className="space-y-4">
                    {experimentData.analysis.strengths.map((strength, index) => (
                      <div key={index} className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                        <p className="text-emerald-800 font-medium">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                    <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-amber-600" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-4">
                    {experimentData.analysis.improvements.map((improvement, index) => (
                      <div key={index} className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                        <p className="text-amber-800 font-medium">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experimentData.analysis.keyInsights.map((insight, index) => (
                  <div key={index} className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-purple-800 font-medium">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'parameters':
        return (
          <div className="space-y-8">
            {/* Parameter Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Parameter Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(experimentData.parameters).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="text-2xl font-bold" style={{ color: getParameterColor(key) }}>
                        {value}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {key === 'temperature' && 'Controls randomness and creativity in responses'}
                      {key === 'top_p' && 'Nucleus sampling parameter for diversity control'}
                      {key === 'max_tokens' && 'Maximum length of the generated response'}
                      {key === 'frequency_penalty' && 'Reduces repetition based on token frequency'}
                      {key === 'presence_penalty' && 'Encourages introduction of new topics'}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(value / (key === 'max_tokens' ? 1000 : 2)) * 100}%`,
                          backgroundColor: getParameterColor(key)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter Impact Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Parameter Impact Analysis</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Temperature (0.8) - High Creativity</h4>
                  <p className="text-blue-800 text-sm">
                    The high temperature setting contributed significantly to the creative and expressive nature of the response. 
                    This setting allowed for more varied word choices and creative narrative techniques.
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Top-p (0.9) - Balanced Diversity</h4>
                  <p className="text-emerald-800 text-sm">
                    The nucleus sampling setting maintained good coherence while allowing for creative expression. 
                    This balance helped achieve both quality and originality.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Presence Penalty (0.1) - Topic Expansion</h4>
                  <p className="text-purple-800 text-sm">
                    The slight presence penalty encouraged the introduction of new concepts and prevented repetitive themes, 
                    contributing to the rich narrative development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'comparisons':
        return (
          <div className="space-y-8">
            {/* Performance Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Comparison</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">This Experiment</h4>
                  <div className="text-3xl font-bold text-blue-600">{experimentData.metrics.overall_quality}%</div>
                  <div className="text-sm text-blue-700">Overall Quality</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Model Average</h4>
                  <div className="text-3xl font-bold text-gray-600">{experimentData.comparisons.averageForModel.quality}%</div>
                  <div className="text-sm text-gray-700">GPT-4 Average</div>
                </div>
                <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-900 mb-2">Improvement</h4>
                  <div className="text-3xl font-bold text-emerald-600">
                    +{(experimentData.metrics.overall_quality - experimentData.comparisons.averageForModel.quality).toFixed(1)}%
                  </div>
                  <div className="text-sm text-emerald-700">Above Average</div>
                </div>
              </div>

              {/* Similar Experiments */}
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Similar Experiments</h4>
              <div className="space-y-4">
                {experimentData.comparisons.similarExperiments.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{exp.name}</h5>
                        <div className="text-sm text-gray-600">Temperature: {exp.temperature}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold" style={{ color: getQualityColor(exp.qualityScore) }}>
                            {exp.qualityScore}%
                          </div>
                          <div className="text-xs text-gray-500">Quality</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold" style={{ color: getQualityColor(exp.creativityScore) }}>
                            {exp.creativityScore}%
                          </div>
                          <div className="text-xs text-gray-500">Creativity</div>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-px h-5 bg-gray-300"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{experimentData.name}</h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Model: {experimentData.model}</span>
                <span>•</span>
                <span>Quality: {experimentData.metrics.overall_quality}%</span>
                <span>•</span>
                <span>{new Date(experimentData.response.timestamp).toLocaleString()}</span>
                {experimentData.mock_mode && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      Mock Mode
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              <HeartIcon className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SingleExperimentResults;
