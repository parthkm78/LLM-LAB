/**
 * @fileoverview Bridge Routes for Frontend Compatibility
 * @description Routes that bridge the existing frontend API calls to the new controller architecture
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const ExperimentController = require('../controllers/ExperimentController');
const ResponseController = require('../controllers/ResponseController');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize controllers
const experimentController = new ExperimentController();
const responseController = new ResponseController();

/**
 * Frontend-compatible experiment routes
 */

// GET /api/experiments - List all experiments
router.get('/', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: GET /experiments');
  await experimentController.getAllExperiments(req, res, next);
}));

// GET /api/experiments/:id - Get experiment by ID
router.get('/:id', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: GET /experiments/:id', { id: req.params.id });
  await experimentController.getExperimentById(req, res, next);
}));

// POST /api/experiments - Create new experiment
router.post('/', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: POST /experiments', { body: req.body });
  await experimentController.createExperiment(req, res, next);
}));

// PUT /api/experiments/:id - Update experiment
router.put('/:id', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: PUT /experiments/:id', { id: req.params.id });
  await experimentController.updateExperiment(req, res, next);
}));

// DELETE /api/experiments/:id - Delete experiment
router.delete('/:id', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: DELETE /experiments/:id', { id: req.params.id });
  await experimentController.deleteExperiment(req, res, next);
}));

module.exports = router;
