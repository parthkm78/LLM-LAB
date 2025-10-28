import React from 'react';
import { 
  InformationCircleIcon, 
  ChartBarIcon,
  CpuChipIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CodeBracketIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';

const About = () => {
  const metrics = [
    {
      icon: ChartBarIcon,
      name: "Coherence Score",
      description: "Measures logical flow, consistency, and how well ideas connect throughout the response using advanced NLP analysis."
    },
    {
      icon: AcademicCapIcon,
      name: "Completeness Score", 
      description: "Evaluates whether the response thoroughly addresses the prompt and covers expected topics with comprehensive analysis."
    },
    {
      icon: CodeBracketIcon,
      name: "Readability Score",
      description: "Assesses text clarity, sentence structure, and overall ease of understanding using linguistic complexity metrics."
    },
    {
      icon: LightBulbIcon,
      name: "Relevance Score",
      description: "Determines how well the response matches the prompt intent and maintains topic focus throughout the content."
    }
  ];

  const features = [
    {
      icon: CpuChipIcon,
      title: "Advanced AI Analysis",
      description: "Powered by sophisticated algorithms that analyze multiple dimensions of text quality"
    },
    {
      icon: ChartBarIcon,
      title: "Real-time Metrics",
      description: "Get instant feedback on response quality with detailed breakdowns and insights"
    },
    {
      icon: SparklesIcon,
      title: "Parameter Optimization",
      description: "Discover optimal temperature and top_p settings for your specific use cases"
    },
    {
      icon: UserGroupIcon,
      title: "Comparison Tools",
      description: "Side-by-side analysis of multiple responses to identify the best performing variants"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <InformationCircleIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          About LLM Response Quality Analyzer
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
          A comprehensive platform for analyzing, optimizing, and comparing Large Language Model responses 
          through advanced quality metrics and parameter testing.
        </p>
      </div>

      {/* Project Overview */}
      <Card className="p-6 sm:p-8 mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
          Project Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div>
            <p className="text-gray-600 leading-relaxed mb-6">
              This application helps developers, researchers, and AI enthusiasts understand how LLM parameters 
              like temperature and top_p influence the quality of generated responses. By generating multiple 
              responses with different parameter combinations and analyzing them with custom metrics, users can 
              make informed decisions about optimal parameter settings.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Built with modern web technologies and powered by advanced natural language processing algorithms, 
              our platform provides scientific insights into LLM behavior and performance optimization.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-sm sm:text-base">Optimize LLM parameters for specific use cases</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-sm sm:text-base">Compare response quality across different models</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-sm sm:text-base">Generate detailed analytical reports</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 text-sm sm:text-base">Make data-driven decisions for AI implementation</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quality Metrics */}
      <Card className="p-6 sm:p-8 mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Quality Metrics Explained
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6 sm:p-8 mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-4 sm:p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Development Info */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Development Information
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
            This project was developed as part of the GenAI-Labs Challenge, demonstrating advanced 
            capabilities in LLM parameter analysis and response quality evaluation. The application 
            combines modern web development practices with cutting-edge AI technologies to provide 
            a comprehensive solution for LLM optimization.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Version 2.1.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>GenAI-Labs Challenge</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;
