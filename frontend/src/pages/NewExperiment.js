import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Services
import { experimentsAPI } from '../services/api';

const NewExperiment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    temperature_min: 0.1,
    temperature_max: 1.0,
    temperature_step: 0.1,
    top_p_min: 0.1,
    top_p_max: 1.0,
    top_p_step: 0.1,
    max_tokens: 150,
    response_count: 5
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Experiment name is required');
        return;
      }
      
      if (!formData.prompt.trim()) {
        toast.error('Prompt is required');
        return;
      }
      
      if (formData.temperature_min >= formData.temperature_max) {
        toast.error('Temperature min must be less than max');
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
