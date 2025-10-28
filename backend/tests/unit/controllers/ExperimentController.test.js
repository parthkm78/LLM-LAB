/**
 * @fileoverview Unit Tests for ExperimentController
 * @description Comprehensive tests for the ExperimentController class
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

// Mock dependencies
const mockExperimentModel = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  getParameterCombinations: jest.fn()
};

const mockResponseModel = {
  findByExperiment: jest.fn(),
  getStatsByExperiment: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

// Mock utilities
jest.mock('../utils/errors', () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message, details) {
      super(message);
      this.name = 'ValidationError';
      this.statusCode = 400;
      this.details = details;
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
      this.statusCode = 404;
    }
  },
  DatabaseError: class DatabaseError extends Error {
    constructor(message, originalError) {
      super(message);
      this.name = 'DatabaseError';
      this.statusCode = 500;
      this.originalError = originalError;
    }
  }
}));

jest.mock('../utils/validators', () => ({
  validateExperimentData: jest.fn()
}));

jest.mock('../utils/logger', () => mockLogger);

const ExperimentController = require('../controllers/ExperimentController');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');
const { validateExperimentData } = require('../utils/validators');

describe('ExperimentController', () => {
  let controller;
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Create controller instance with mocked dependencies
    controller = new ExperimentController(mockExperimentModel, mockResponseModel);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock request/response objects
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });

  describe('getAllExperiments', () => {
    test('should return experiments with pagination', async () => {
      // Arrange
      const mockExperiments = [
        { id: 1, name: 'Test Experiment 1' },
        { id: 2, name: 'Test Experiment 2' }
      ];
      
      mockExperimentModel.findAll.mockResolvedValue(mockExperiments);
      mockExperimentModel.count.mockResolvedValue(10);
      
      req.query = { page: '1', limit: '2' };

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(mockExperimentModel.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 2,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        status: undefined,
        search: undefined
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          experiments: mockExperiments,
          pagination: {
            page: 1,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNextPage: true,
            hasPrevPage: false
          }
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
          version: '1.0.0'
        })
      });
    });

    test('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockExperimentModel.findAll.mockRejectedValue(dbError);

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(DatabaseError));
      expect(mockLogger.error).toHaveBeenCalled();
    });

    test('should validate page number limits', async () => {
      // Arrange
      req.query = { page: '99999' };
      mockExperimentModel.findAll.mockResolvedValue([]);
      mockExperimentModel.count.mockResolvedValue(0);

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(mockExperimentModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 99999 })
      );
    });
  });

  describe('getExperimentById', () => {
    test('should return experiment with related data', async () => {
      // Arrange
      const mockExperiment = { id: 1, name: 'Test Experiment' };
      const mockResponses = [{ id: 1, content: 'Test response' }];
      const mockCombinations = [{ temperature: 0.5, top_p: 0.9 }];
      
      req.params.id = '1';
      
      mockExperimentModel.findById.mockResolvedValue(mockExperiment);
      mockResponseModel.findByExperiment.mockResolvedValue(mockResponses);
      mockExperimentModel.getParameterCombinations.mockResolvedValue(mockCombinations);

      // Act
      await controller.getExperimentById(req, res, next);

      // Assert
      expect(mockExperimentModel.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          experiment: mockExperiment,
          responses: mockResponses,
          parameter_combinations: mockCombinations,
          statistics: expect.objectContaining({
            total_responses: 1,
            total_combinations: 1
          })
        },
        meta: expect.any(Object)
      });
    });

    test('should return 404 for non-existent experiment', async () => {
      // Arrange
      req.params.id = '999';
      mockExperimentModel.findById.mockResolvedValue(null);

      // Act
      await controller.getExperimentById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    test('should validate ID parameter', async () => {
      // Arrange
      req.params.id = 'invalid';

      // Act
      await controller.getExperimentById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('createExperiment', () => {
    test('should create experiment with valid data', async () => {
      // Arrange
      const experimentData = {
        name: 'Test Experiment',
        prompt: 'Test prompt',
        temperature_min: 0.1,
        temperature_max: 1.0
      };
      
      const createdExperiment = { id: 1, ...experimentData };
      const mockCombinations = [{ temperature: 0.5, top_p: 0.9 }];
      
      req.body = experimentData;
      
      validateExperimentData.mockReturnValue({ isValid: true, errors: [] });
      mockExperimentModel.create.mockResolvedValue(createdExperiment);
      mockExperimentModel.getParameterCombinations.mockResolvedValue(mockCombinations);

      // Act
      await controller.createExperiment(req, res, next);

      // Assert
      expect(validateExperimentData).toHaveBeenCalledWith(experimentData);
      expect(mockExperimentModel.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          experiment: createdExperiment,
          parameter_combinations: mockCombinations,
          statistics: expect.objectContaining({
            total_combinations: 1
          })
        },
        meta: expect.any(Object)
      });
    });

    test('should handle validation errors', async () => {
      // Arrange
      req.body = { name: '' }; // Invalid data
      
      validateExperimentData.mockReturnValue({
        isValid: false,
        errors: ['Name is required']
      });

      // Act
      await controller.createExperiment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('updateExperiment', () => {
    test('should update experiment successfully', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const existingExperiment = { id: 1, name: 'Original Name' };
      const updatedExperiment = { id: 1, name: 'Updated Name' };
      
      req.params.id = '1';
      req.body = updateData;
      
      mockExperimentModel.findById.mockResolvedValue(existingExperiment);
      validateExperimentData.mockReturnValue({ isValid: true, errors: [] });
      mockExperimentModel.update.mockResolvedValue({ changes: 1 });
      mockExperimentModel.findById.mockResolvedValueOnce(existingExperiment)
        .mockResolvedValueOnce(updatedExperiment);

      // Act
      await controller.updateExperiment(req, res, next);

      // Assert
      expect(mockExperimentModel.update).toHaveBeenCalledWith(1, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 for non-existent experiment', async () => {
      // Arrange
      req.params.id = '999';
      req.body = { name: 'Updated Name' };
      
      mockExperimentModel.findById.mockResolvedValue(null);

      // Act
      await controller.updateExperiment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('deleteExperiment', () => {
    test('should delete experiment successfully', async () => {
      // Arrange
      const existingExperiment = { id: 1, name: 'Test Experiment' };
      
      req.params.id = '1';
      
      mockExperimentModel.findById.mockResolvedValue(existingExperiment);
      mockExperimentModel.delete.mockResolvedValue({ deleted: true });

      // Act
      await controller.deleteExperiment(req, res, next);

      // Assert
      expect(mockExperimentModel.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          deleted: true,
          experiment_id: 1
        },
        meta: expect.any(Object)
      });
    });

    test('should return 404 for non-existent experiment', async () => {
      // Arrange
      req.params.id = '999';
      mockExperimentModel.findById.mockResolvedValue(null);

      // Act
      await controller.deleteExperiment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('getExperimentStats', () => {
    test('should return experiment statistics', async () => {
      // Arrange
      const mockExperiment = { id: 1, name: 'Test Experiment' };
      const mockStats = {
        total_responses: 10,
        avg_quality_scores: { coherence: 0.8 }
      };
      
      req.params.id = '1';
      
      mockExperimentModel.findById.mockResolvedValue(mockExperiment);
      mockResponseModel.getStatsByExperiment.mockResolvedValue(mockStats);

      // Act
      await controller.getExperimentStats(req, res, next);

      // Assert
      expect(mockResponseModel.getStatsByExperiment).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          experiment_id: 1,
          statistics: mockStats
        },
        meta: expect.any(Object)
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      // Arrange
      mockExperimentModel.findAll.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(DatabaseError));
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    test('should handle edge cases in pagination', async () => {
      // Arrange
      req.query = { page: '0', limit: '0' };
      mockExperimentModel.findAll.mockResolvedValue([]);
      mockExperimentModel.count.mockResolvedValue(0);

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(mockExperimentModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,  // Should default to 1
          limit: 1  // Should default to minimum 1
        })
      );
    });

    test('should limit maximum page size', async () => {
      // Arrange
      req.query = { limit: '999' };
      mockExperimentModel.findAll.mockResolvedValue([]);
      mockExperimentModel.count.mockResolvedValue(0);

      // Act
      await controller.getAllExperiments(req, res, next);

      // Assert
      expect(mockExperimentModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100  // Should be capped at 100
        })
      );
    });
  });
});
