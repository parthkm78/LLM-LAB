/**
 * Experiment Service
 * 
 * Business logic layer for experiment management.
 * Handles CRUD operations, validations, and business rules for experiments.
 */

const mockExperiments = require('../data/mockExperiments');
const { 
  applyFiltering, 
  applyPagination, 
  applySorting 
} = require('../utils/helpers');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');

class ExperimentService {
  /**
   * Get all experiments with filtering, pagination, and sorting
   */
  async getAllExperiments(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      type,
      tags,
      search,
      userId,
      dateFrom,
      dateTo
    } = options;

    let experiments = [...mockExperiments];

    // Apply filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (userId) filters.createdBy = userId;

    experiments = applyFiltering(experiments, filters);

    // Apply tag filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      experiments = experiments.filter(exp => 
        tagArray.some(tag => exp.tags.includes(tag))
      );
    }

    // Apply date range filtering
    if (dateFrom || dateTo) {
      experiments = experiments.filter(exp => {
        const expDate = new Date(exp.createdAt);
        if (dateFrom && expDate < new Date(dateFrom)) return false;
        if (dateTo && expDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      experiments = experiments.filter(exp =>
        exp.name.toLowerCase().includes(searchLower) ||
        exp.description.toLowerCase().includes(searchLower) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    experiments = applySorting(experiments, sortBy, sortOrder);

    // Get total count before pagination
    const total = experiments.length;

    // Apply pagination
    const paginatedExperiments = applyPagination(experiments, page, limit);

    return {
      experiments: paginatedExperiments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        status,
        type,
        tags,
        search,
        userId,
        dateFrom,
        dateTo
      },
      sorting: {
        sortBy,
        sortOrder
      }
    };
  }

  /**
   * Get experiment by ID
   */
  async getExperimentById(id) {
    const experiment = mockExperiments.find(exp => exp.id === id);
    
    if (!experiment) {
      throw new NotFoundError('Experiment', id);
    }

    return experiment;
  }

  /**
   * Create new experiment
   */
  async createExperiment(experimentData, userId) {
    // Validate required fields
    this.validateExperimentData(experimentData);

    // Check for duplicate name
    const existingExperiment = mockExperiments.find(exp => 
      exp.name.toLowerCase() === experimentData.name.toLowerCase()
    );

    if (existingExperiment) {
      throw new ConflictError(`Experiment with name '${experimentData.name}' already exists`);
    }

    // Generate new ID
    const newId = this.generateId();

    // Create experiment object
    const newExperiment = {
      id: newId,
      name: experimentData.name,
      description: experimentData.description || '',
      type: experimentData.type || 'A/B',
      status: 'draft',
      configuration: experimentData.configuration || {},
      tags: experimentData.tags || [],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        participants: 0,
        conversionRate: 0,
        significanceLevel: 0
      },
      variants: experimentData.variants || [],
      schedule: experimentData.schedule || null
    };

    // Add to mock data (in real app, save to database)
    mockExperiments.push(newExperiment);

    return newExperiment;
  }

  /**
   * Update experiment
   */
  async updateExperiment(id, updateData, userId) {
    const experiment = await this.getExperimentById(id);

    // Check if user has permission to update
    if (experiment.createdBy !== userId) {
      throw new ForbiddenError('You can only update your own experiments');
    }

    // Validate update data
    if (updateData.name) {
      this.validateExperimentName(updateData.name, id);
    }

    // Check if experiment can be updated based on status
    if (experiment.status === 'running' && updateData.variants) {
      throw new ValidationError({
        variants: 'Cannot modify variants of a running experiment'
      });
    }

    // Apply updates
    const updatedExperiment = {
      ...experiment,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update in mock data
    const index = mockExperiments.findIndex(exp => exp.id === id);
    mockExperiments[index] = updatedExperiment;

    return updatedExperiment;
  }

  /**
   * Delete experiment
   */
  async deleteExperiment(id, userId) {
    const experiment = await this.getExperimentById(id);

    // Check if user has permission to delete
    if (experiment.createdBy !== userId) {
      throw new ForbiddenError('You can only delete your own experiments');
    }

    // Check if experiment can be deleted
    if (experiment.status === 'running') {
      throw new ValidationError({
        status: 'Cannot delete a running experiment. Stop it first.'
      });
    }

    // Remove from mock data
    const index = mockExperiments.findIndex(exp => exp.id === id);
    mockExperiments.splice(index, 1);

    return { message: 'Experiment deleted successfully' };
  }

  /**
   * Start experiment
   */
  async startExperiment(id, userId) {
    const experiment = await this.getExperimentById(id);

    // Check permissions
    if (experiment.createdBy !== userId) {
      throw new ForbiddenError('You can only start your own experiments');
    }

    // Validate experiment can be started
    if (experiment.status !== 'draft') {
      throw new ValidationError({
        status: `Cannot start experiment with status '${experiment.status}'`
      });
    }

    if (!experiment.variants || experiment.variants.length < 2) {
      throw new ValidationError({
        variants: 'Experiment must have at least 2 variants to start'
      });
    }

    // Update status
    const updatedExperiment = await this.updateExperiment(id, {
      status: 'running',
      startedAt: new Date().toISOString()
    }, userId);

    return updatedExperiment;
  }

  /**
   * Stop experiment
   */
  async stopExperiment(id, userId) {
    const experiment = await this.getExperimentById(id);

    // Check permissions
    if (experiment.createdBy !== userId) {
      throw new ForbiddenError('You can only stop your own experiments');
    }

    // Validate experiment can be stopped
    if (experiment.status !== 'running') {
      throw new ValidationError({
        status: `Cannot stop experiment with status '${experiment.status}'`
      });
    }

    // Update status
    const updatedExperiment = await this.updateExperiment(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    }, userId);

    return updatedExperiment;
  }

  /**
   * Get experiment statistics
   */
  async getExperimentStats(id) {
    const experiment = await this.getExperimentById(id);

    // Calculate stats based on experiment data
    const stats = {
      id: experiment.id,
      name: experiment.name,
      status: experiment.status,
      participants: experiment.metrics.participants,
      conversionRate: experiment.metrics.conversionRate,
      duration: this.calculateDuration(experiment),
      variants: experiment.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        participants: variant.participants || 0,
        conversions: variant.conversions || 0,
        conversionRate: this.calculateConversionRate(variant.participants, variant.conversions)
      })),
      significanceLevel: experiment.metrics.significanceLevel,
      confidence: this.calculateConfidence(experiment),
      isStatisticallySignificant: experiment.metrics.significanceLevel >= 0.95
    };

    return stats;
  }

  /**
   * Clone experiment
   */
  async cloneExperiment(id, userId) {
    const originalExperiment = await this.getExperimentById(id);

    const clonedData = {
      name: `${originalExperiment.name} (Copy)`,
      description: originalExperiment.description,
      type: originalExperiment.type,
      configuration: { ...originalExperiment.configuration },
      tags: [...originalExperiment.tags],
      variants: originalExperiment.variants.map(variant => ({ ...variant })),
      schedule: originalExperiment.schedule ? { ...originalExperiment.schedule } : null
    };

    return await this.createExperiment(clonedData, userId);
  }

  /**
   * Validate experiment data
   */
  validateExperimentData(data) {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Experiment name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Experiment name must be less than 100 characters';
    }

    if (data.description && data.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (data.type && !['A/B', 'multivariate', 'split'].includes(data.type)) {
      errors.type = 'Invalid experiment type';
    }

    if (data.variants) {
      if (!Array.isArray(data.variants)) {
        errors.variants = 'Variants must be an array';
      } else if (data.variants.length > 0) {
        data.variants.forEach((variant, index) => {
          if (!variant.name) {
            errors[`variants[${index}].name`] = 'Variant name is required';
          }
          if (variant.traffic && (variant.traffic < 0 || variant.traffic > 100)) {
            errors[`variants[${index}].traffic`] = 'Variant traffic must be between 0 and 100';
          }
        });
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Validate experiment name for uniqueness
   */
  validateExperimentName(name, excludeId = null) {
    const existingExperiment = mockExperiments.find(exp => 
      exp.name.toLowerCase() === name.toLowerCase() && exp.id !== excludeId
    );

    if (existingExperiment) {
      throw new ConflictError(`Experiment with name '${name}' already exists`);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate experiment duration
   */
  calculateDuration(experiment) {
    if (!experiment.startedAt) return null;

    const startDate = new Date(experiment.startedAt);
    const endDate = experiment.completedAt ? new Date(experiment.completedAt) : new Date();
    
    const durationMs = endDate - startDate;
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else {
      return `${hours} hours`;
    }
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(participants, conversions) {
    if (!participants || participants === 0) return 0;
    return Math.round((conversions / participants) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(experiment) {
    // Simplified confidence calculation
    // In a real application, this would use proper statistical methods
    const participants = experiment.metrics.participants;
    
    if (participants < 100) return 'Low';
    if (participants < 1000) return 'Medium';
    return 'High';
  }
}

module.exports = new ExperimentService();
