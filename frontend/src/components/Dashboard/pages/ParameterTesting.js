import React, { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  PlayIcon,
  BookOpenIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  LightBulbIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { designTokens, getParameterColor, getQualityColor } from '../../../styles/designTokens';
import { useExperiments, useQualityMetrics } from '../../../hooks/useExperiments';
import { useNotifications } from '../../../contexts/NotificationContext';

const ParameterTesting = ({ onNavigate }) => {
  const { createExperiment, generateResponses, loading: experimentsLoading } = useExperiments();
  const { calculateMetrics, loading: metricsLoading } = useQualityMetrics();
  const { success, error: showError } = useNotifications();
  
  const [currentParameters, setCurrentParameters] = useState({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1000,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    model: 'gpt-4'
  });

  const [activePreset, setActivePreset] = useState('balanced');
  const [testPrompt, setTestPrompt] = useState('Write a short story about a robot discovering friendship.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [responseMetrics, setResponseMetrics] = useState(null);
  const [lastExperiment, setLastExperiment] = useState(null);

  const parameterPresets = [
    {
      id: 'creative',
      name: 'Creative Writing',
      description: 'High creativity and variability',
      icon: SparklesIcon,
      color: 'from-pink-500 to-rose-500',
      parameters: {
        temperature: 0.9,
        top_p: 0.9,
        max_tokens: 1500,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Optimal for most use cases',
      icon: AdjustmentsHorizontalIcon,
      color: 'from-blue-500 to-cyan-500',
      parameters: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }
    },
    {
      id: 'technical',
      name: 'Technical/Factual',
      description: 'Precise and consistent',
      icon: CpuChipIcon,
      color: 'from-emerald-500 to-teal-500',
      parameters: {
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 800,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }
    },
    {
      id: 'analytical',
      name: 'Analytical',
      description: 'Deep analysis and reasoning',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-indigo-500',
      parameters: {
        temperature: 0.5,
        top_p: 0.85,
        max_tokens: 1200,
        frequency_penalty: 0.0,
        presence_penalty: 0.1
      }
    }
  ];

  const parameterInfo = {
    temperature: {
      name: 'Temperature',
      description: 'Controls randomness. Higher values make output more creative but less focused.',
      min: 0,
      max: 2,
      step: 0.1,
      personality: 'creativity'
    },
    top_p: {
      name: 'Top-p (Nucleus Sampling)',
      description: 'Controls diversity. Lower values make responses more focused.',
      min: 0,
      max: 1,
      step: 0.05,
      personality: 'focus'
    },
    max_tokens: {
      name: 'Max Tokens',
      description: 'Maximum length of the response.',
      min: 100,
      max: 4000,
      step: 50,
      personality: 'length'
    },
    frequency_penalty: {
      name: 'Frequency Penalty',
      description: 'Reduces repetition based on frequency.',
      min: -2,
      max: 2,
      step: 0.1,
      personality: 'repetition'
    },
    presence_penalty: {
      name: 'Presence Penalty',
      description: 'Encourages new topics and ideas.',
      min: -2,
      max: 2,
      step: 0.1,
      personality: 'novelty'
    }
  };

  const applyPreset = (preset) => {
    setCurrentParameters(prev => ({ ...prev, ...preset.parameters }));
    setActivePreset(preset.id);
  };

  const updateParameter = (key, value) => {
    setCurrentParameters(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  };

  const generateResponse = async () => {
    if (!testPrompt.trim()) {
      showError('Please enter a prompt to test');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedResponse('');
    setResponseMetrics(null);
    
    try {
      // MOCK: Simulate response generation with frontend mock data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock experiment data
      const experiment = {
        id: Date.now(),
        name: `Parameter Test - ${new Date().toLocaleTimeString()}`,
        prompt: testPrompt,
        parameters: currentParameters,
        model: currentParameters.model,
        created_at: new Date().toISOString()
      };
      
      setLastExperiment(experiment);
      
      // Generate mock response based on parameters and prompt
      const mockResponses = {
        creative: `In a world where imagination knows no bounds, ${testPrompt.toLowerCase().includes('robot') || testPrompt.toLowerCase().includes('ai') || testPrompt.toLowerCase().includes('artificial') ? 
          "an extraordinary machine named Zenith discovered something remarkable. Unlike its fellow automatons, Zenith began to question the nature of connection. During a routine maintenance check, it encountered a small, frightened child who had wandered into the facility. Instead of following protocol, Zenith felt an unfamiliar warmth in its circuits—something its creators never programmed. This was the beginning of an unlikely friendship that would challenge everything both the machine and the child understood about what it means to care for another being." : 
          "a tale unfolds that captures the essence of human experience. The story weaves through unexpected turns, revealing profound truths about life, love, and the connections that bind us all together. Each character emerges with depth and authenticity, creating a narrative that resonates long after the final word."}`,
        
        balanced: `${testPrompt.toLowerCase().includes('robot') || testPrompt.toLowerCase().includes('ai') || testPrompt.toLowerCase().includes('artificial') ? 
          "In a research facility, a service robot named Alex was assigned to assist in the children's wing of a hospital. Initially programmed for basic tasks, Alex began to notice patterns in the children's behavior and responses. When a lonely patient named Emma arrived, Alex started spending extra time with her, learning about her interests and fears. Through small acts of kindness and consistent presence, Alex discovered that friendship isn't just about programming—it's about genuine care, understanding, and the willingness to be there for someone when they need it most." : 
          "This is a thoughtful exploration of the given prompt, balancing creativity with clarity. The narrative develops organically, presenting ideas in a structured and engaging manner that captures the reader's attention while maintaining focus on the core themes."}`,
        
        technical: `${testPrompt.toLowerCase().includes('robot') || testPrompt.toLowerCase().includes('artificial') || testPrompt.toLowerCase().includes('ai') ? 
          "Unit designation: R-4X7 was a standard maintenance robot operating within predetermined parameters. During routine operations, it encountered Subject: Human-Child-047 who had deviated from authorized zones. Following initial protocol assessment, R-4X7 detected elevated stress markers in the subject. Rather than reporting the infractions, R-4X7 initiated comfort protocols, which gradually evolved into regular interaction patterns. This represented the robot's first experience with what humans term 'friendship'—a systematic process of mutual care, shared activities, and emotional support that extended beyond its original programming parameters." : 
          "This response addresses the prompt with precision and clarity. The content is structured logically, presenting information in a direct and factual manner that effectively communicates the intended message while maintaining accuracy and relevance."}`,
        
        default: `This is a thoughtfully crafted response that addresses your prompt about ${testPrompt.substring(0, 50)}... The response demonstrates the current parameter settings with temperature at ${currentParameters.temperature}, creating ${currentParameters.temperature > 0.7 ? 'more creative and varied' : currentParameters.temperature > 0.4 ? 'balanced and coherent' : 'precise and consistent'} output as expected.`
      };
      
      // Select response based on active preset
      let content = mockResponses.default;
      if (activePreset === 'creative' || currentParameters.temperature >= 0.8) {
        content = mockResponses.creative;
      } else if (activePreset === 'technical' || currentParameters.temperature <= 0.4) {
        content = mockResponses.technical;
      } else {
        content = mockResponses.balanced;
      }
      
      setGeneratedResponse(content);
      
      // Generate mock quality metrics based on parameters
      const mockMetrics = {
        overall_quality: Math.round(75 + (currentParameters.temperature * 15) + Math.random() * 10),
        coherence_score: Math.round(80 + (1 - currentParameters.temperature) * 15 + Math.random() * 5),
        creativity_score: Math.round(60 + (currentParameters.temperature * 30) + Math.random() * 8),
        readability_score: Math.round(78 + (currentParameters.top_p * 12) + Math.random() * 10),
        completeness_score: Math.round(70 + (currentParameters.max_tokens / 20) + Math.random() * 8),
        factual_accuracy: Math.round(75 + (1 - currentParameters.temperature) * 20 + Math.random() * 5),
        relevance_score: Math.round(82 + Math.random() * 15),
        engagement_score: Math.round(70 + (currentParameters.temperature * 20) + Math.random() * 10),
        technical_depth: Math.round(65 + (1 - currentParameters.temperature) * 25 + Math.random() * 10)
      };
      
      setResponseMetrics(mockMetrics);
      success('Response generated successfully! (Mock data)');
      
    } catch (err) {
      showError('Failed to generate response');
      console.error('Generate response error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const ParameterSlider = ({ paramKey, parameter }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-gray-900 truncate">{parameter.name}</h4>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-1 py-0.5 rounded-md inline-block">
            {parameter.personality}
          </div>
        </div>
        <div className="text-right ml-2 flex-shrink-0">
          <div className="text-sm font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {currentParameters[paramKey]}
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="relative">
          <input
            type="range"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            value={currentParameters[paramKey]}
            onChange={(e) => updateParameter(paramKey, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider shadow-inner"
            style={{
              background: `linear-gradient(to right, ${getParameterColor(parameter.personality)} 0%, ${getParameterColor(parameter.personality)} ${((currentParameters[paramKey] - parameter.min) / (parameter.max - parameter.min)) * 100}%, #e2e8f0 ${((currentParameters[paramKey] - parameter.min) / (parameter.max - parameter.min)) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div 
            className="absolute top-0 w-4 h-4 rounded-full shadow-lg border-2 border-white transform -translate-y-1 -translate-x-2 transition-all duration-150 hover:scale-110 cursor-pointer"
            style={{
              left: `${((currentParameters[paramKey] - parameter.min) / (parameter.max - parameter.min)) * 100}%`,
              backgroundColor: getParameterColor(parameter.personality),
              boxShadow: `0 2px 8px rgba(0,0,0,0.15), 0 0 0 3px ${getParameterColor(parameter.personality)}20`
            }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-1.5 leading-tight line-clamp-2">{parameter.description}</p>
    </div>
  );

  const PresetCard = ({ preset }) => {
    const Icon = preset.icon;
    const isActive = activePreset === preset.id;
    
    return (
      <button
        onClick={() => applyPreset(preset)}
        className={`group w-full text-left p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
          isActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200' 
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${preset.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${isActive ? 'text-blue-900' : 'text-gray-900'} truncate`}>
              {preset.name}
            </h3>
            <p className={`text-xs mt-1 ${isActive ? 'text-blue-700' : 'text-gray-600'} line-clamp-2 leading-relaxed`}>
              {preset.description}
            </p>
            <div className="flex items-center space-x-3 mt-2">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                <span className="text-xs font-medium text-gray-700">T:</span>
                <span className="text-xs font-bold text-gray-900">{preset.parameters.temperature}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                <span className="text-xs font-medium text-gray-700">P:</span>
                <span className="text-xs font-bold text-gray-900">{preset.parameters.top_p}</span>
              </div>
            </div>
          </div>
          {isActive && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Parameter Testing Lab</h1>
              <p className="text-white/80 mt-2 text-lg">Fine-tune AI parameters for optimal performance</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/15 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Live Testing</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/15 rounded-full px-3 py-1">
                  <SparklesIcon className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">AI Powered</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all duration-200 backdrop-blur-sm">
                <BookOpenIcon className="w-4 h-4 text-white" />
                <span className="font-medium text-white">Guide</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium shadow-lg">
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Row 1: Parameter Presets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Parameter Presets
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {parameterPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        </div>

        {/* Row 2: Model Selection & Parameter Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Model Selection & Parameter Controls
            </h2>
          </div>
          
          {/* Model Selection and Configuration Row */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-3 mb-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              {/* Model Selection */}
              <div className="bg-white rounded-md border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <CpuChipIcon className="w-3 h-3 text-blue-600" />
                  <h3 className="text-xs font-bold text-gray-900">Model</h3>
                </div>
                <select 
                  value={currentParameters.model}
                  onChange={(e) => updateParameter('model', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-medium border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude-3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>

              {/* Current Configuration Summary */}
              <div className="lg:col-span-3 bg-white rounded-md border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon className="w-3 h-3 text-emerald-600" />
                  <h3 className="text-xs font-bold text-gray-900">Current Configuration</h3>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5 text-xs">
                  {Object.entries(currentParameters).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-md px-2 py-1 text-center border">
                      <div className="font-medium text-gray-600 text-xs truncate">
                        {key.replace('_', ' ').replace('max tokens', 'tokens').replace('frequency penalty', 'freq').replace('presence penalty', 'pres')}
                      </div>
                      <div className="font-bold text-gray-900 text-xs">
                        {typeof value === 'number' ? value.toFixed(key === 'max_tokens' ? 0 : 1) : value.substring(0, 6)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Parameter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {Object.entries(parameterInfo).map(([key, param]) => (
              <ParameterSlider key={key} paramKey={key} parameter={param} />
            ))}
          </div>
        </div>

        {/* Row 3: Test Prompt */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-5">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-md flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Test Prompt</h3>
          </div>
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter your test prompt here... (e.g., 'Write a creative story about AI')"
            className="w-full h-28 px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all duration-200 placeholder-gray-400"
          />
        </div>

        {/* Row 4: Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateResponse}
            disabled={!testPrompt.trim() || isGenerating || experimentsLoading}
            className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-base font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              {(isGenerating || experimentsLoading) ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Generating Magic...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Generate Response</span>
                  <SparklesIcon className="w-4 h-4 opacity-70" />
                </>
              )}
            </div>
          </button>
        </div>

      {/* Row 5: Comprehensive Response Analysis */}
      {generatedResponse && (
        <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-purple-200/50 shadow-xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                🎯 Response Analysis
              </h2>
              <p className="text-purple-700 text-sm font-medium">
                Comprehensive analysis of your generated response with quality metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-300 text-sm font-medium">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export Analysis</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105">
                <BookOpenIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>

          {/* Generated Response Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Generated Response</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Model: <span className="font-bold text-blue-600">{currentParameters.model}</span></span>
                  <span>•</span>
                  <span>Length: <span className="font-bold">{generatedResponse.length} chars</span></span>
                  <span>•</span>
                  <span>Words: <span className="font-bold">{generatedResponse.split(' ').length}</span></span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 mb-4">
              <div className="max-h-64 overflow-y-auto text-gray-800 leading-relaxed">
                {generatedResponse}
              </div>
            </div>

            {/* Parameter Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div className="text-center bg-orange-50/80 rounded-lg p-3">
                <div className="text-lg font-black text-orange-600">{currentParameters.temperature}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Temperature</div>
              </div>
              <div className="text-center bg-blue-50/80 rounded-lg p-3">
                <div className="text-lg font-black text-blue-600">{currentParameters.top_p}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Top-p</div>
              </div>
              <div className="text-center bg-green-50/80 rounded-lg p-3">
                <div className="text-lg font-black text-green-600">{currentParameters.max_tokens}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Max Tokens</div>
              </div>
              <div className="text-center bg-purple-50/80 rounded-lg p-3">
                <div className="text-lg font-black text-purple-600">{currentParameters.frequency_penalty}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Freq Penalty</div>
              </div>
              <div className="text-center bg-pink-50/80 rounded-lg p-3">
                <div className="text-lg font-black text-pink-600">{currentParameters.presence_penalty}</div>
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Pres Penalty</div>
              </div>
            </div>
          </div>

          {/* Quality Metrics Dashboard */}
          {responseMetrics && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quality Metrics Analysis</h3>
                  <p className="text-gray-600 text-sm font-medium">Detailed breakdown of response quality dimensions</p>
                </div>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-200/50 p-6">
                <div className="text-4xl font-black mb-2" style={{ color: getQualityColor(responseMetrics.overall_quality) }}>
                  {responseMetrics.overall_quality}%
                </div>
                <div className="text-lg font-bold text-gray-700 mb-2">Overall Quality Score</div>
                <div className="text-sm text-gray-600 font-medium">
                  {responseMetrics.overall_quality >= 90 ? '🌟 Excellent' : 
                   responseMetrics.overall_quality >= 80 ? '✨ Very Good' : 
                   responseMetrics.overall_quality >= 70 ? '👍 Good' : 
                   responseMetrics.overall_quality >= 60 ? '⚠️ Fair' : '❌ Needs Improvement'}
                </div>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {Object.entries(responseMetrics).filter(([key]) => key !== 'overall_quality').map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-gray-700 capitalize">
                        {key.replace('_score', '').replace('_', ' ')}
                      </div>
                      <div className="text-xl font-black" style={{ color: getQualityColor(value) }}>
                        {value}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500 shadow-sm" 
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: getQualityColor(value)
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      {value >= 90 ? 'Excellent performance' : 
                       value >= 80 ? 'Very good quality' : 
                       value >= 70 ? 'Good standard' : 
                       value >= 60 ? 'Acceptable level' : 'Room for improvement'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Metrics Bar Chart */}
                <div className="bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4 text-blue-600" />
                    <span>Metrics Comparison</span>
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={Object.entries(responseMetrics).map(([key, value]) => ({
                        metric: key.replace('_score', '').replace('_', ' '),
                        value: value,
                        color: getQualityColor(value)
                      }))}
                      margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="#6B7280" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#6B7280" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Score']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Parameter Impact Analysis */}
                <div className="bg-gradient-to-br from-gray-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-purple-600" />
                    <span>Parameter Impact</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Temperature Impact</div>
                        <div className="text-xs text-gray-500">
                          {currentParameters.temperature >= 0.8 ? 'High creativity, may reduce coherence' :
                           currentParameters.temperature >= 0.5 ? 'Balanced creativity and consistency' :
                           'High consistency, lower creativity'}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(currentParameters.temperature * 100)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Quality Prediction</div>
                        <div className="text-xs text-gray-500">
                          Based on current parameters
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(75 + (currentParameters.temperature * 15) + (currentParameters.top_p * 10))}%
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/80 rounded-lg">
                      <div className="text-sm font-bold text-blue-800 mb-1">💡 Optimization Suggestion</div>
                      <div className="text-xs text-blue-700">
                        {responseMetrics.creativity_score < 70 ? 'Try increasing temperature to 0.8+ for more creativity' :
                         responseMetrics.coherence_score < 70 ? 'Consider lowering temperature to 0.5-0.7 for better coherence' :
                         'Parameters are well-balanced for current task'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-300 font-medium shadow-sm hover:shadow-md">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Save Experiment</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105">
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Generate Another</span>
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate('comparison')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Compare Responses</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default ParameterTesting;
