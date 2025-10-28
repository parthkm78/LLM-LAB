import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BeakerIcon, 
  PlayIcon, 
  AdjustmentsHorizontalIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';

const NewExperiment = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [experimentData, setExperimentData] = useState({
    name: '',
    description: '',
    prompt: '',
    temperature_min: 0.1,
    temperature_max: 1.0,
    temperature_step: 0.3,
    top_p_min: 0.8,
    top_p_max: 1.0,
    top_p_step: 0.1,
    max_tokens: 150,
    response_count: 3
  });
  const [createdExperiment, setCreatedExperiment] = useState(null);
  const [results, setResults] = useState(null);

  // Calculate parameter combinations
  const calculateCombinations = () => {
    const tempSteps = Math.ceil((experimentData.temperature_max - experimentData.temperature_min) / experimentData.temperature_step) + 1;
    const topPSteps = Math.ceil((experimentData.top_p_max - experimentData.top_p_min) / experimentData.top_p_step) + 1;
    return tempSteps * topPSteps;
  };

  const handleInputChange = (field, value) => {
    setExperimentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateExperiment = async () => {
    if (!experimentData.name.trim()) {
      toast.error('Please enter an experiment name');
      return;
    }
    if (!experimentData.prompt.trim()) {
      toast.error('Please enter a prompt to test');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await api.post('/experiments', experimentData);
      setCreatedExperiment(response.data.experiment);
      toast.success('Experiment created successfully!');
    } catch (error) {
      console.error('Error creating experiment:', error);
      toast.error('Failed to create experiment');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateResponses = async () => {
    if (!createdExperiment) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await api.post('/responses/generate', {
        experiment_id: createdExperiment.id,
        generate_all: true
      });
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setResults(response.data);
      toast.success(`Generated ${response.data.summary.total_generated} responses!`);
      
    } catch (error) {
      console.error('Error generating responses:', error);
      toast.error('Failed to generate responses');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewResults = () => {
    if (createdExperiment) {
      navigate(`/analysis?experiment=${createdExperiment.id}`);
    }
  };

  const parameterCombinations = calculateCombinations();
  const totalResponses = parameterCombinations * experimentData.response_count;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New LLM Experiment</h1>
            <p className="text-gray-600">Create and run parameter testing experiments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardDocumentIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Experiment Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiment Name *
                </label>
                <Input
                  value={experimentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Temperature vs Creativity Study"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={experimentData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and goals of this experiment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Prompt *
                </label>
                <textarea
                  value={experimentData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder="Enter the prompt that will be tested with different parameters..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  rows="4"
                />
              </div>
            </div>
          </Card>

          {/* Parameter Configuration */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Parameter Ranges</h2>
              <div className="ml-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <InformationCircleIcon className="w-4 h-4" />
                  {parameterCombinations} combinations
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full"></span>
                  Temperature Range
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
                    <Input
                      type="number"
                      value={experimentData.temperature_min}
                      onChange={(e) => handleInputChange('temperature_min', parseFloat(e.target.value))}
                      min="0"
                      max="2"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
                    <Input
                      type="number"
                      value={experimentData.temperature_max}
                      onChange={(e) => handleInputChange('temperature_max', parseFloat(e.target.value))}
                      min="0"
                      max="2"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Step</label>
                    <Input
                      type="number"
                      value={experimentData.temperature_step}
                      onChange={(e) => handleInputChange('temperature_step', parseFloat(e.target.value))}
                      min="0.1"
                      max="1"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Controls randomness: 0 = focused, 1+ = creative
                </div>
              </div>

              {/* Top-p Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></span>
                  Top-p Range
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min</label>
                    <Input
                      type="number"
                      value={experimentData.top_p_min}
                      onChange={(e) => handleInputChange('top_p_min', parseFloat(e.target.value))}
                      min="0.1"
                      max="1"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max</label>
                    <Input
                      type="number"
                      value={experimentData.top_p_max}
                      onChange={(e) => handleInputChange('top_p_max', parseFloat(e.target.value))}
                      min="0.1"
                      max="1"
                      step="0.1"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Step</label>
                    <Input
                      type="number"
                      value={experimentData.top_p_step}
                      onChange={(e) => handleInputChange('top_p_step', parseFloat(e.target.value))}
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Controls diversity: lower = more focused
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <Input
                  type="number"
                  value={experimentData.max_tokens}
                  onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                  min="50"
                  max="1000"
                  step="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responses per Combination
                </label>
                <Input
                  type="number"
                  value={experimentData.response_count}
                  onChange={(e) => handleInputChange('response_count', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </Card>

          {/* Progress Section */}
          {isGenerating && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cog6ToothIcon className="w-6 h-6 text-blue-600 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900">Generating Responses</h3>
              </div>
              
              <ProgressBar 
                progress={generationProgress} 
                className="mb-4"
                showPercentage
              />
              
              <div className="text-sm text-gray-600">
                Processing {totalResponses} total responses across {parameterCombinations} parameter combinations...
              </div>
            </Card>
          )}

          {/* Results Summary */}
          {results && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Generation Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.total_generated}</div>
                  <div className="text-sm text-gray-600">Responses Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.summary.parameter_combinations}</div>
                  <div className="text-sm text-gray-600">Parameter Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.summary.total_errors}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{results.mock_mode ? 'Mock' : 'Live'}</div>
                  <div className="text-sm text-gray-600">API Mode</div>
                </div>
              </div>
              
              <Button 
                onClick={handleViewResults}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <ChartBarIcon className="w-5 h-5 mr-2" />
                View Analysis & Results
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DocumentChartBarIcon className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Experiment Overview</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Parameter Combinations</span>
                <span className="font-semibold text-gray-900">{parameterCombinations}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Responses</span>
                <span className="font-semibold text-gray-900">{totalResponses}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Estimated Time</span>
                <span className="font-semibold text-gray-900">{Math.ceil(totalResponses * 2 / 60)} min</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Quality Metrics</span>
                <span className="font-semibold text-green-600">6 metrics</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!createdExperiment ? (
              <Button 
                onClick={handleCreateExperiment}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isCreating ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <BeakerIcon className="w-5 h-5 mr-2" />
                )}
                {isCreating ? 'Creating...' : 'Create Experiment'}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleGenerateResponses}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {isGenerating ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <PlayIcon className="w-5 h-5 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Responses'}
                </Button>
                
                {results && (
                  <Button 
                    onClick={handleViewResults}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    View Results
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Pro Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start with small ranges to test quickly</li>
                  <li>• Temperature affects creativity vs focus</li>
                  <li>• Top-p controls response diversity</li>
                  <li>• Use 3-5 responses per combination</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewExperiment;
        return;
      }
      
      if (formData.top_p_min >= formData.top_p_max) {
        toast.error('Top-p min must be less than max');
        return;
      }
      
      // Prepare experiment data
      const experimentData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        prompt: formData.prompt.trim(),
        parameters: {
          temperature_min: formData.temperature_min,
          temperature_max: formData.temperature_max,
          temperature_step: formData.temperature_step,
          top_p_min: formData.top_p_min,
          top_p_max: formData.top_p_max,
          top_p_step: formData.top_p_step,
          max_tokens: formData.max_tokens,
          response_count: formData.response_count
        }
      };
      
      // Submit to API
      const result = await experimentsAPI.create(experimentData);
      
      toast.success('Experiment created successfully!');
      navigate(`/experiments/${result.id}`);
    } catch (error) {
      toast.error('Failed to create experiment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Experiment
        </h1>
        <p className="text-gray-600">
          Set up parameter ranges to analyze how they affect LLM response quality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Experiment Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Temperature Comparison Study"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the experiment"
              />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt *
            </label>
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={4}
              value={formData.prompt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the prompt you want to test with different parameters..."
            />
          </div>
        </div>

        {/* Parameter Configuration */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Parameter Configuration
          </h2>
          
          {/* Temperature Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Temperature</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Value
                </label>
                <input
                  type="number"
                  name="temperature_min"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Value
                </label>
                <input
                  type="number"
                  name="temperature_max"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Size
                </label>
                <input
                  type="number"
                  name="temperature_step"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={formData.temperature_step}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Top-p Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Top-p</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Value
                </label>
                <input
                  type="number"
                  name="top_p_min"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.top_p_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Value
                </label>
                <input
                  type="number"
                  name="top_p_max"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.top_p_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Size
                </label>
                <input
                  type="number"
                  name="top_p_step"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={formData.top_p_step}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                name="max_tokens"
                min="50"
                max="2000"
                value={formData.max_tokens}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responses per Combination
              </label>
              <input
                type="number"
                name="response_count"
                min="1"
                max="10"
                value={formData.response_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/experiments')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{loading ? 'Creating...' : 'Create Experiment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewExperiment;
