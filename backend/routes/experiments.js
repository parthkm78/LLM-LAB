const express = require('express');
const router = express.Router();
const ExperimentModel = require('../models/Experiment');
const ResponseModel = require('../models/Response');

// Validation middleware
const validateExperiment = (req, res, next) => {
  const { name, prompt } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Experiment name is required' });
  }
  
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  next();
};

// GET /api/experiments - List all experiments
router.get('/', async (req, res) => {
  try {
    const experiments = await ExperimentModel.findAll();
    res.json({ 
      experiments,
      total: experiments.length
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

// POST /api/experiments - Create new experiment
router.post('/', validateExperiment, async (req, res) => {
  try {
    const experimentData = {
      name: req.body.name.trim(),
      description: req.body.description?.trim() || '',
      prompt: req.body.prompt.trim(),
      temperature_min: req.body.temperature_min || 0.1,
      temperature_max: req.body.temperature_max || 1.0,
      temperature_step: req.body.temperature_step || 0.1,
      top_p_min: req.body.top_p_min || 0.1,
      top_p_max: req.body.top_p_max || 1.0,
      top_p_step: req.body.top_p_step || 0.1,
      max_tokens: req.body.max_tokens || 150,
      response_count: req.body.response_count || 5
    };
    
    const experiment = await ExperimentModel.create(experimentData);
    
    // Generate parameter combinations for this experiment
    const parameterCombinations = await ExperimentModel.getParameterCombinations(experiment.id);
    
    res.status(201).json({ 
      experiment,
      parameter_combinations: parameterCombinations,
      total_combinations: parameterCombinations.length
    });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

// GET /api/experiments/:id - Get specific experiment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const experiment = await ExperimentModel.findById(parseInt(id));
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get responses for this experiment
    const responses = await ResponseModel.findByExperiment(parseInt(id));
    
    // Get parameter combinations
    const parameterCombinations = await ExperimentModel.getParameterCombinations(parseInt(id));
    
    res.json({ 
      experiment,
      responses,
      parameter_combinations: parameterCombinations,
      total_responses: responses.length
    });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

// PUT /api/experiments/:id - Update experiment
router.put('/:id', validateExperiment, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const updateData = {
      name: req.body.name.trim(),
      description: req.body.description?.trim() || '',
      prompt: req.body.prompt.trim(),
      temperature_min: req.body.temperature_min,
      temperature_max: req.body.temperature_max,
      temperature_step: req.body.temperature_step,
      top_p_min: req.body.top_p_min,
      top_p_max: req.body.top_p_max,
      top_p_step: req.body.top_p_step,
      max_tokens: req.body.max_tokens,
      response_count: req.body.response_count
    };
    
    const result = await ExperimentModel.update(parseInt(id), updateData);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    const updatedExperiment = await ExperimentModel.findById(parseInt(id));
    res.json({ experiment: updatedExperiment });
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Failed to update experiment' });
  }
});

// DELETE /api/experiments/:id - Delete experiment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const result = await ExperimentModel.delete(parseInt(id));
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    res.json({ message: 'Experiment deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    res.status(500).json({ error: 'Failed to delete experiment' });
  }
});

// GET /api/experiments/:id/parameter-combinations - Get parameter combinations for experiment
router.get('/:id/parameter-combinations', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const parameterCombinations = await ExperimentModel.getParameterCombinations(parseInt(id));
    
    res.json({ 
      experiment_id: parseInt(id),
      parameter_combinations: parameterCombinations,
      total: parameterCombinations.length
    });
  } catch (error) {
    console.error('Error fetching parameter combinations:', error);
    res.status(500).json({ error: 'Failed to fetch parameter combinations' });
  }
});

module.exports = router;
