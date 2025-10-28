import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import LoadingSpinner from '../components/LoadingSpinner';
import MetricsCard from '../components/MetricsCard';
import ResponseCard from '../components/ResponseCard';
import MetricsChart from '../components/MetricsChart';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import ExportButton from '../components/ExportButton';

// Services
import { experimentsAPI, responsesAPI, metricsAPI } from '../services/api';

const ExperimentDetail = () => {
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [responses, setResponses] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadExperiment();
  }, [id]);

  const loadExperiment = async () => {
    try {
      setLoading(true);
      const experimentData = await experimentsAPI.getById(id);
      setExperiment(experimentData);
      
      // Load existing responses if any
      const responsesData = await responsesAPI.getByExperiment(id);
      setResponses(responsesData.responses || []);
      
      // Load metrics for existing responses
      if (responsesData.responses && responsesData.responses.length > 0) {
        const metricsData = {};
        for (const response of responsesData.responses) {
          try {
            const responseMetrics = await metricsAPI.calculate(response.id);
            metricsData[response.id] = responseMetrics.metrics;
          } catch (error) {
            console.error(`Failed to load metrics for response ${response.id}:`, error);
          }
        }
        setMetrics(metricsData);
      }
    } catch (error) {
      toast.error('Failed to load experiment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateResponses = async () => {
    if (!experiment) return;
    
    try {
      setGenerating(true);
      
      // Calculate total responses to generate
      const tempRange = (experiment.temperature_max - experiment.temperature_min) / experiment.temperature_step + 1;
      const topPRange = (experiment.top_p_max - experiment.top_p_min) / experiment.top_p_step + 1;
      const totalCombinations = Math.round(tempRange * topPRange);
      const totalResponses = totalCombinations * experiment.response_count;
      
      setProgress({ current: 0, total: totalResponses });
      
      const generateData = {
        experiment_id: id,
        prompt: experiment.prompt,
        parameters: {
          temperature_min: experiment.temperature_min,
          temperature_max: experiment.temperature_max,
          temperature_step: experiment.temperature_step,
          top_p_min: experiment.top_p_min,
          top_p_max: experiment.top_p_max,
          top_p_step: experiment.top_p_step,
          max_tokens: experiment.max_tokens,
          response_count: experiment.response_count
        }
      };
      
      // Generate responses
      const result = await responsesAPI.generate(generateData);
      
      if (result.responses) {
        setResponses(result.responses);
        
        // Calculate metrics for new responses
        const newMetrics = {};
        for (let i = 0; i < result.responses.length; i++) {
          const response = result.responses[i];
          setProgress({ current: i + 1, total: totalResponses });
          
          try {
            const responseMetrics = await metricsAPI.calculate(response.id);
            newMetrics[response.id] = responseMetrics.metrics;
          } catch (error) {
            console.error(`Failed to calculate metrics for response ${response.id}:`, error);
          }
        }
        
        setMetrics(newMetrics);
        toast.success(`Generated ${result.responses.length} responses successfully!`);
      }
    } catch (error) {
      toast.error('Failed to generate responses');
      console.error(error);
    } finally {
      setGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const toggleResponseSelection = (responseId) => {
    setSelectedResponses(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    );
  };

  const addToComparison = (responseId) => {
    if (!selectedResponses.includes(responseId)) {
      setSelectedResponses(prev => [...prev, responseId]);
    }
    setShowComparison(true);
  };

  const calculateAverageMetrics = () => {
    if (Object.keys(metrics).length === 0) return null;
    
    const allMetrics = Object.values(metrics);
    const avgMetrics = {
      coherence: allMetrics.reduce((sum, m) => sum + (m.coherence || 0), 0) / allMetrics.length,
      completeness: allMetrics.reduce((sum, m) => sum + (m.completeness || 0), 0) / allMetrics.length,
      readability: allMetrics.reduce((sum, m) => sum + (m.readability || 0), 0) / allMetrics.length,
      length_appropriateness: allMetrics.reduce((sum, m) => sum + (m.length_appropriateness || 0), 0) / allMetrics.length
    };
    
    return avgMetrics;
  };

  const getChartData = () => {
    if (responses.length === 0) return [];
    
    return responses.map(response => ({
      id: response.id,
      temperature: response.temperature,
      top_p: response.top_p,
      coherence: metrics[response.id]?.coherence || 0,
      completeness: metrics[response.id]?.completeness || 0,
      readability: metrics[response.id]?.readability || 0,
      length_appropriateness: metrics[response.id]?.length_appropriateness || 0,
      overall_score: metrics[response.id] ? 
        (metrics[response.id].coherence + metrics[response.id].completeness + 
         metrics[response.id].readability + metrics[response.id].length_appropriateness) / 4 : 0
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Experiment not found
        </h2>
        <Link to="/experiments" className="text-blue-600 hover:text-blue-800">
          Back to Experiments
        </Link>
      </div>
    );
  }

  const avgMetrics = calculateAverageMetrics();
  const chartData = getChartData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {experiment.name}
          </h1>
          <p className="text-gray-600 mb-4">
            {experiment.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Created: {new Date(experiment.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Responses: {responses.length}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {responses.length > 0 && (
            <>
              <ExportButton 
                experimentId={id}
                experimentName={experiment.name}
                disabled={loading || generating}
              />
              <button
                onClick={() => setShowComparison(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Compare Selected ({selectedResponses.length})
              </button>
            </>
          )}
          <button
            onClick={generateResponses}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            {generating && <LoadingSpinner size="sm" color="white" />}
            <span>{generating ? 'Generating...' : 'Generate Responses'}</span>
          </button>
        </div>
      </div>

      {/* Generation Progress */}
      {generating && progress.total > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating Responses</h3>
          <ProgressBar 
            progress={progress.current} 
            total={progress.total}
            label="Progress"
          />
        </div>
      )}

      {/* Average Metrics */}
      {avgMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricsCard
            title="Coherence"
            value={avgMetrics.coherence}
            description="Average logical flow score"
            icon="🧩"
            color="blue"
          />
          <MetricsCard
            title="Completeness"
            value={avgMetrics.completeness}
            description="Average thoroughness score"
            icon="✅"
            color="green"
          />
          <MetricsCard
            title="Readability"
            value={avgMetrics.readability}
            description="Average clarity score"
            icon="📖"
            color="purple"
          />
          <MetricsCard
            title="Length"
            value={avgMetrics.length_appropriateness}
            description="Average length score"
            icon="📏"
            color="orange"
          />
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsChart
            data={chartData}
            type="line"
            title="Quality vs Temperature"
            xKey="temperature"
            yKey="overall_score"
          />
          <MetricsChart
            data={chartData}
            type="scatter"
            title="Temperature vs Top-p"
            xKey="temperature"
            yKey="top_p"
          />
        </div>
      )}

      {/* Responses Grid */}
      {responses.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Generated Responses ({responses.length})
          </h2>
          <div className="grid gap-6">
            {responses.map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                metrics={metrics[response.id]}
                onSelect={toggleResponseSelection}
                isSelected={selectedResponses.includes(response.id)}
                onCompare={addToComparison}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No responses generated yet
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Generate Responses" to start analyzing your prompt with different parameters.
          </p>
        </div>
      )}

      {/* Comparison Modal */}
      <Modal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        title="Response Comparison"
        size="xl"
      >
        <div className="space-y-6">
          {selectedResponses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Select responses to compare by clicking the "Compare" button on response cards.
            </p>
          ) : (
            <div className="grid gap-6">
              {selectedResponses.map(responseId => {
                const response = responses.find(r => r.id === responseId);
                return response ? (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    metrics={metrics[response.id]}
                    onSelect={() => {}}
                    isSelected={false}
                    onCompare={() => {}}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExperimentDetail;
