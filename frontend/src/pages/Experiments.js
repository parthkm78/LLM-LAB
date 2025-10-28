import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import LoadingSpinner from '../components/LoadingSpinner';

// Services
import { experimentsAPI } from '../services/api';

const Experiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const data = await experimentsAPI.getAll();
      setExperiments(data.experiments || []);
    } catch (error) {
      toast.error('Failed to load experiments');
      console.error(error);
      // Set some mock data for development
      setExperiments([
        {
          id: 1,
          name: "Temperature Comparison",
          description: "Testing different temperature values",
          created_at: "2024-01-15T10:30:00Z",
          responses_count: 6
        },
        {
          id: 2,
          name: "Creative Writing Analysis",
          description: "Analyzing creative writing prompts",
          created_at: "2024-01-14T15:45:00Z",
          responses_count: 8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperiment = async (id) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      try {
        await experimentsAPI.delete(id);
        setExperiments(prev => prev.filter(exp => exp.id !== id));
        toast.success('Experiment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete experiment');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
        <Link
          to="/experiments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          New Experiment
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧪</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No experiments yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first experiment to start analyzing LLM responses.
          </p>
          <Link
            to="/experiments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Create First Experiment
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {experiment.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {experiment.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>
                      Created: {new Date(experiment.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      Responses: {experiment.responses_count || 0}
                    </span>
                    {experiment.prompt && (
                      <span>
                        Prompt: {experiment.prompt.slice(0, 50)}...
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/experiments/${experiment.id}`}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => deleteExperiment(experiment.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Parameter Summary */}
              {experiment.parameters && (
                <div className="bg-gray-50 rounded-md p-3 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Temperature:</span>
                      <span className="ml-1 text-gray-600">
                        {experiment.parameters.temperature_min} - {experiment.parameters.temperature_max}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Top-p:</span>
                      <span className="ml-1 text-gray-600">
                        {experiment.parameters.top_p_min} - {experiment.parameters.top_p_max}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Max Tokens:</span>
                      <span className="ml-1 text-gray-600">
                        {experiment.parameters.max_tokens}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Responses per combo:</span>
                      <span className="ml-1 text-gray-600">
                        {experiment.parameters.response_count}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experiments;
