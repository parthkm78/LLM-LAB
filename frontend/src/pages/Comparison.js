import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon,
  XMarkIcon,
  ScaleIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import MetricsCard from '../components/MetricsCard';

const Comparison = () => {
  const [responses, setResponses] = useState([
    {
      id: 1,
      title: 'Response A',
      content: 'Artificial Intelligence represents one of the most transformative technologies of our time. It encompasses machine learning, natural language processing, and computer vision, enabling machines to perform tasks that traditionally required human intelligence. The applications are vast, from healthcare diagnosis to autonomous vehicles.',
      parameters: { temperature: 0.3, topP: 0.8, model: 'GPT-4' },
      metrics: { coherence: 88, completeness: 85, readability: 92, relevance: 90 }
    },
    {
      id: 2,
      title: 'Response B',
      content: 'AI is like, totally amazing! It\'s everywhere now - in our phones, cars, even our refrigerators. It can write poems, create art, and solve complex problems. The future is here, and it\'s powered by artificial intelligence. We\'re living in the age of machines that can think!',
      parameters: { temperature: 1.2, topP: 0.95, model: 'GPT-4' },
      metrics: { coherence: 72, completeness: 68, readability: 85, relevance: 75 }
    }
  ]);

  const [newResponse, setNewResponse] = useState({
    title: '',
    content: '',
    parameters: { temperature: 0.7, topP: 0.9, model: 'GPT-4' }
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const addResponse = () => {
    if (!newResponse.title.trim() || !newResponse.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Mock metrics calculation
    const mockMetrics = {
      coherence: Math.floor(Math.random() * 30) + 70,
      completeness: Math.floor(Math.random() * 30) + 70,
      readability: Math.floor(Math.random() * 30) + 70,
      relevance: Math.floor(Math.random() * 30) + 70
    };

    const response = {
      id: Date.now(),
      ...newResponse,
      metrics: mockMetrics
    };

    setResponses([...responses, response]);
    setNewResponse({
      title: '',
      content: '',
      parameters: { temperature: 0.7, topP: 0.9, model: 'GPT-4' }
    });
    setShowAddForm(false);
  };

  const removeResponse = (id) => {
    setResponses(responses.filter(r => r.id !== id));
  };

  const getComparisonInsights = () => {
    if (responses.length < 2) return null;

    const avgMetrics = responses.reduce((acc, response) => {
      Object.keys(response.metrics).forEach(metric => {
        acc[metric] = (acc[metric] || 0) + response.metrics[metric];
      });
      return acc;
    }, {});

    Object.keys(avgMetrics).forEach(metric => {
      avgMetrics[metric] = Math.round(avgMetrics[metric] / responses.length);
    });

    const bestResponse = responses.reduce((best, current) => {
      const bestTotal = Object.values(best.metrics).reduce((a, b) => a + b, 0);
      const currentTotal = Object.values(current.metrics).reduce((a, b) => a + b, 0);
      return currentTotal > bestTotal ? current : best;
    });

    return { avgMetrics, bestResponse };
  };

  const insights = getComparisonInsights();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Response Comparison</h1>
              <p className="text-gray-600 text-sm sm:text-base">Compare multiple LLM responses side by side</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm} className="w-full sm:w-auto">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Response
          </Button>
        </div>
      </div>

      {/* Add Response Form */}
      {showAddForm && (
        <Card className="p-6 mb-8 border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Response</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              label="Response Title"
              value={newResponse.title}
              onChange={(e) => setNewResponse({...newResponse, title: e.target.value})}
              placeholder="e.g., Response C"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Content
              </label>
              <textarea
                value={newResponse.content}
                onChange={(e) => setNewResponse({...newResponse, content: e.target.value})}
                placeholder="Paste or type the LLM response here..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={newResponse.parameters.temperature}
                onChange={(e) => setNewResponse({
                  ...newResponse, 
                  parameters: {...newResponse.parameters, temperature: parseFloat(e.target.value)}
                })}
              />
              <Input
                label="Top P"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newResponse.parameters.topP}
                onChange={(e) => setNewResponse({
                  ...newResponse, 
                  parameters: {...newResponse.parameters, topP: parseFloat(e.target.value)}
                })}
              />
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={newResponse.parameters.model}
                  onChange={(e) => setNewResponse({
                    ...newResponse, 
                    parameters: {...newResponse.parameters, model: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="GPT-4">GPT-4</option>
                  <option value="GPT-3.5">GPT-3.5</option>
                  <option value="Claude">Claude</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button onClick={addResponse} className="w-full sm:w-auto">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Response
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Overview */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Average Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(insights.avgMetrics).map(([metric, score]) => (
                <div key={metric} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-xs sm:text-sm text-gray-600 capitalize">{metric}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ScaleIcon className="w-5 h-5 mr-2" />
              Best Performing Response
            </h3>
            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-emerald-900">{insights.bestResponse.title}</h4>
                <div className="text-lg sm:text-xl font-bold text-emerald-700">
                  {Math.round(Object.values(insights.bestResponse.metrics).reduce((a, b) => a + b, 0) / 4)}%
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 mb-3 line-clamp-2">
                {insights.bestResponse.content}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-emerald-700">
                <span>Temp: {insights.bestResponse.parameters.temperature}</span>
                <span>Top P: {insights.bestResponse.parameters.topP}</span>
                <span>{insights.bestResponse.parameters.model}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Response Comparison Grid */}
      {responses.length === 0 ? (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Responses to Compare</h3>
          <p className="text-gray-600 mb-6">Add at least two responses to start comparing their quality metrics.</p>
          <Button onClick={() => setShowAddForm(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Your First Response
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6">
          {responses.map((response, index) => (
            <Card key={response.id} className="p-4 sm:p-6 relative">
              {/* Remove Button */}
              {responses.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResponse(response.id)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}

              {/* Response Header */}
              <div className="mb-4 pr-8">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{response.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span>Temp: {response.parameters.temperature}</span>
                  <span>Top P: {response.parameters.topP}</span>
                  <span>{response.parameters.model}</span>
                </div>
              </div>

              {/* Response Content */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Response Content</h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                  <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{response.content}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Quality Metrics</h4>
                {Object.entries(response.metrics).map(([metric, score]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 capitalize">{metric}</span>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 w-8 sm:w-10 text-right">{score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Score */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm sm:text-base">Overall Score</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    {Math.round(Object.values(response.metrics).reduce((a, b) => a + b, 0) / 4)}%
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Comparison Actions */}
      {responses.length >= 2 && (
        <div className="mt-8 text-center">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="ghost">
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Re-analyze All
              </Button>
              <Button variant="ghost">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Export Comparison
              </Button>
              <Button variant="ghost">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Generate Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Comparison;
