/**
 * @fileoverview Bridge Routes for Responses API
 * @description Routes that bridge the existing frontend response API calls to the new architecture
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseController = require('../controllers/ResponseController');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize controller
const responseController = new ResponseController();

/**
 * Frontend-compatible response routes
 */

// POST /api/responses/generate - Generate responses for experiment (matches frontend expectation)
router.post('/generate', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: POST /responses/generate', { body: req.body });
  
  try {
    const { experimentId, prompt, parameters, count = 5 } = req.body;
    
    if (!experimentId || !prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Experiment ID and prompt are required',
          statusCode: 400
        }
      });
    }
    
    // Set default parameters if not provided
    const defaultParams = {
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      max_tokens: 150,
      model: 'gpt-3.5-turbo',
      ...parameters
    };
    
    // Create responses
    const responses = [];
    for (let i = 0; i < count; i++) {
      try {
        const response = await responseController.generateSingleResponse(
          experimentId,
          prompt,
          defaultParams
        );
        responses.push(response);
      } catch (error) {
        logger.error(`Error generating response ${i + 1}:`, error);
        responses.push({
          error: error.message,
          parameters: defaultParams
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        experiment_id: experimentId,
        responses,
        total_generated: responses.filter(r => !r.error).length,
        total_errors: responses.filter(r => r.error).length
      }
    });
  } catch (error) {
    logger.error('Error in generate responses:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate responses',
        statusCode: 500
      }
    });
  }
}));

// GET /api/responses/:id - Get response by ID
router.get('/:id', asyncHandler(async (req, res, next) => {
  const response = await responseController.getResponseById(req, res, next);
  return response;
}));

// POST /api/responses/compare - Compare multiple responses
router.post('/compare', asyncHandler(async (req, res, next) => {
  const comparison = await responseController.compareResponses(req, res, next);
  return comparison;
}));

module.exports = router;
