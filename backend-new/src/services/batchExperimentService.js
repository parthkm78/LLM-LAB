/**
 * Batch Experiment Service
 * 
 * Business logic layer for batch experiment management.
 * Handles bulk operations, batch processing, and coordinated experiment management.
 */

const mockBatchExperiments = require('../data/mockBatchExperiments');
const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');
const { 
  applyFiltering, 
  applyPagination, 
  applySorting 
} = require('../utils/helpers');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');

class BatchExperimentService {
  /**
   * Get all batch experiments with filtering, pagination, and sorting
   */
  async getAllBatchExperiments(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      type,
      userId,
      dateFrom,
      dateTo,
      search
    } = options;

    let batches = [...mockBatchExperiments];

    // Apply filters
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (userId) filters.createdBy = userId;

    batches = applyFiltering(batches, filters);

    // Apply date range filtering
    if (dateFrom || dateTo) {
      batches = batches.filter(batch => {
        const batchDate = new Date(batch.createdAt);
        if (dateFrom && batchDate < new Date(dateFrom)) return false;
        if (dateTo && batchDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      batches = batches.filter(batch =>
        batch.name.toLowerCase().includes(searchLower) ||
        batch.description.toLowerCase().includes(searchLower) ||
        batch.experiments.some(expId => expId.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    batches = applySorting(batches, sortBy, sortOrder);

    // Get total count before pagination
    const total = batches.length;

    // Apply pagination
    const paginatedBatches = applyPagination(batches, page, limit);

    // Enhance batch data with experiment details
    const enhancedBatches = await Promise.all(
      paginatedBatches.map(batch => this.enhanceBatchData(batch))
    );

    return {
      batches: enhancedBatches,
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
        userId,
        dateFrom,
        dateTo,
        search
      },
      sorting: {
        sortBy,
        sortOrder
      }
    };
  }

  /**
   * Get batch experiment by ID
   */
  async getBatchExperimentById(id) {
    const batch = mockBatchExperiments.find(batch => batch.id === id);
    
    if (!batch) {
      throw new NotFoundError('Batch Experiment', id);
    }

    return await this.enhanceBatchData(batch);
  }

  /**
   * Create new batch experiment
   */
  async createBatchExperiment(batchData, userId) {
    // Validate required fields
    this.validateBatchExperimentData(batchData);

    // Validate experiments exist
    await this.validateExperimentIds(batchData.experiments);

    // Check for duplicate name
    const existingBatch = mockBatchExperiments.find(batch => 
      batch.name.toLowerCase() === batchData.name.toLowerCase()
    );

    if (existingBatch) {
      throw new ConflictError(`Batch experiment with name '${batchData.name}' already exists`);
    }

    // Generate new ID
    const newId = this.generateId();

    // Create batch experiment object
    const newBatch = {
      id: newId,
      name: batchData.name,
      description: batchData.description || '',
      type: batchData.type || 'sequential',
      status: 'draft',
      experiments: batchData.experiments || [],
      configuration: batchData.configuration || {},
      schedule: batchData.schedule || null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        totalExperiments: batchData.experiments.length,
        activeExperiments: 0,
        completedExperiments: 0,
        totalResponses: 0,
        averageConversionRate: 0
      }
    };

    // Add to mock data
    mockBatchExperiments.push(newBatch);

    return await this.enhanceBatchData(newBatch);
  }

  /**
   * Update batch experiment
   */
  async updateBatchExperiment(id, updateData, userId) {
    const batch = await this.getBatchExperimentById(id);

    // Check if user has permission to update
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only update your own batch experiments');
    }

    // Validate update data
    if (updateData.name) {
      this.validateBatchName(updateData.name, id);
    }

    if (updateData.experiments) {
      await this.validateExperimentIds(updateData.experiments);
    }

    // Check if batch can be updated based on status
    if (batch.status === 'running' && updateData.experiments) {
      throw new ValidationError({
        experiments: 'Cannot modify experiments in a running batch'
      });
    }

    // Apply updates
    const updatedBatch = {
      ...batch,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Recalculate metrics if experiments changed
    if (updateData.experiments) {
      updatedBatch.metrics.totalExperiments = updateData.experiments.length;
    }

    // Update in mock data
    const index = mockBatchExperiments.findIndex(batch => batch.id === id);
    mockBatchExperiments[index] = updatedBatch;

    return await this.enhanceBatchData(updatedBatch);
  }

  /**
   * Delete batch experiment
   */
  async deleteBatchExperiment(id, userId) {
    const batch = await this.getBatchExperimentById(id);

    // Check if user has permission to delete
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only delete your own batch experiments');
    }

    // Check if batch can be deleted
    if (batch.status === 'running') {
      throw new ValidationError({
        status: 'Cannot delete a running batch experiment. Stop it first.'
      });
    }

    // Remove from mock data
    const index = mockBatchExperiments.findIndex(batch => batch.id === id);
    mockBatchExperiments.splice(index, 1);

    return { message: 'Batch experiment deleted successfully' };
  }

  /**
   * Start batch experiment
   */
  async startBatchExperiment(id, userId) {
    const batch = await this.getBatchExperimentById(id);

    // Check permissions
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only start your own batch experiments');
    }

    // Validate batch can be started
    if (batch.status !== 'draft') {
      throw new ValidationError({
        status: `Cannot start batch experiment with status '${batch.status}'`
      });
    }

    if (!batch.experiments || batch.experiments.length === 0) {
      throw new ValidationError({
        experiments: 'Batch experiment must contain at least one experiment'
      });
    }

    // Validate all experiments are in draft status
    const experiments = await this.getExperimentDetails(batch.experiments);
    const nonDraftExperiments = experiments.filter(exp => exp.status !== 'draft');
    
    if (nonDraftExperiments.length > 0) {
      throw new ValidationError({
        experiments: `Cannot start batch: experiments ${nonDraftExperiments.map(e => e.name).join(', ')} are not in draft status`
      });
    }

    // Update status
    const updatedBatch = await this.updateBatchExperiment(id, {
      status: 'running',
      startedAt: new Date().toISOString()
    }, userId);

    // Start experiments based on batch type
    await this.executeStartStrategy(updatedBatch);

    return updatedBatch;
  }

  /**
   * Stop batch experiment
   */
  async stopBatchExperiment(id, userId) {
    const batch = await this.getBatchExperimentById(id);

    // Check permissions
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only stop your own batch experiments');
    }

    // Validate batch can be stopped
    if (batch.status !== 'running') {
      throw new ValidationError({
        status: `Cannot stop batch experiment with status '${batch.status}'`
      });
    }

    // Stop all running experiments in the batch
    await this.stopAllExperimentsInBatch(batch.experiments);

    // Update status
    const updatedBatch = await this.updateBatchExperiment(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    }, userId);

    return updatedBatch;
  }

  /**
   * Get batch experiment metrics
   */
  async getBatchMetrics(id) {
    const batch = await this.getBatchExperimentById(id);
    const experiments = await this.getExperimentDetails(batch.experiments);

    const metrics = {
      batchId: batch.id,
      batchName: batch.name,
      status: batch.status,
      totalExperiments: experiments.length,
      activeExperiments: experiments.filter(exp => exp.status === 'running').length,
      completedExperiments: experiments.filter(exp => exp.status === 'completed').length,
      draftExperiments: experiments.filter(exp => exp.status === 'draft').length,
      experiments: await Promise.all(experiments.map(async (exp) => {
        const responses = mockResponses.filter(resp => resp.experimentId === exp.id);
        const conversions = responses.filter(resp => resp.converted);
        
        return {
          id: exp.id,
          name: exp.name,
          status: exp.status,
          responses: responses.length,
          conversions: conversions.length,
          conversionRate: this.calculateConversionRate(responses.length, conversions.length)
        };
      })),
      aggregatedMetrics: await this.calculateAggregatedMetrics(experiments)
    };

    return metrics;
  }

  /**
   * Clone batch experiment
   */
  async cloneBatchExperiment(id, userId) {
    const originalBatch = await this.getBatchExperimentById(id);

    const clonedData = {
      name: `${originalBatch.name} (Copy)`,
      description: originalBatch.description,
      type: originalBatch.type,
      experiments: [...originalBatch.experiments],
      configuration: { ...originalBatch.configuration },
      schedule: originalBatch.schedule ? { ...originalBatch.schedule } : null
    };

    return await this.createBatchExperiment(clonedData, userId);
  }

  /**
   * Add experiment to batch
   */
  async addExperimentToBatch(batchId, experimentId, userId) {
    const batch = await this.getBatchExperimentById(batchId);

    // Check permissions
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only modify your own batch experiments');
    }

    // Check if batch can be modified
    if (batch.status === 'running') {
      throw new ValidationError({
        status: 'Cannot add experiments to a running batch'
      });
    }

    // Validate experiment exists and is not already in batch
    await this.validateExperimentIds([experimentId]);
    
    if (batch.experiments.includes(experimentId)) {
      throw new ConflictError(`Experiment ${experimentId} is already in this batch`);
    }

    // Add experiment to batch
    const updatedExperiments = [...batch.experiments, experimentId];
    
    return await this.updateBatchExperiment(batchId, {
      experiments: updatedExperiments
    }, userId);
  }

  /**
   * Remove experiment from batch
   */
  async removeExperimentFromBatch(batchId, experimentId, userId) {
    const batch = await this.getBatchExperimentById(batchId);

    // Check permissions
    if (batch.createdBy !== userId) {
      throw new ForbiddenError('You can only modify your own batch experiments');
    }

    // Check if batch can be modified
    if (batch.status === 'running') {
      throw new ValidationError({
        status: 'Cannot remove experiments from a running batch'
      });
    }

    // Check if experiment is in batch
    if (!batch.experiments.includes(experimentId)) {
      throw new NotFoundError(`Experiment ${experimentId} not found in batch`);
    }

    // Remove experiment from batch
    const updatedExperiments = batch.experiments.filter(id => id !== experimentId);
    
    return await this.updateBatchExperiment(batchId, {
      experiments: updatedExperiments
    }, userId);
  }

  /**
   * Execute start strategy based on batch type
   */
  async executeStartStrategy(batch) {
    switch (batch.type) {
      case 'parallel':
        // Start all experiments simultaneously
        await this.startAllExperimentsInBatch(batch.experiments);
        break;
      
      case 'sequential':
        // Start first experiment only
        if (batch.experiments.length > 0) {
          await this.startExperiment(batch.experiments[0]);
        }
        break;
      
      case 'scheduled':
        // Start based on schedule configuration
        await this.scheduleExperimentStart(batch);
        break;
      
      default:
        throw new ValidationError({
          type: `Unknown batch type: ${batch.type}`
        });
    }
  }

  /**
   * Enhance batch data with experiment details
   */
  async enhanceBatchData(batch) {
    const experiments = await this.getExperimentDetails(batch.experiments);
    
    return {
      ...batch,
      experimentDetails: experiments,
      metrics: await this.calculateBatchMetrics(batch, experiments)
    };
  }

  /**
   * Get experiment details
   */
  async getExperimentDetails(experimentIds) {
    return experimentIds.map(id => {
      const experiment = mockExperiments.find(exp => exp.id === id);
      if (!experiment) {
        throw new NotFoundError('Experiment', id);
      }
      return experiment;
    });
  }

  /**
   * Calculate batch metrics
   */
  async calculateBatchMetrics(batch, experiments) {
    const totalResponses = experiments.reduce((sum, exp) => {
      const responses = mockResponses.filter(resp => resp.experimentId === exp.id);
      return sum + responses.length;
    }, 0);

    const totalConversions = experiments.reduce((sum, exp) => {
      const responses = mockResponses.filter(resp => resp.experimentId === exp.id);
      const conversions = responses.filter(resp => resp.converted);
      return sum + conversions.length;
    }, 0);

    const averageConversionRate = this.calculateConversionRate(totalResponses, totalConversions);

    return {
      totalExperiments: experiments.length,
      activeExperiments: experiments.filter(exp => exp.status === 'running').length,
      completedExperiments: experiments.filter(exp => exp.status === 'completed').length,
      totalResponses,
      totalConversions,
      averageConversionRate
    };
  }

  /**
   * Calculate aggregated metrics
   */
  async calculateAggregatedMetrics(experiments) {
    const metrics = {
      totalResponses: 0,
      totalConversions: 0,
      averageConversionRate: 0,
      bestPerformingExperiment: null,
      worstPerformingExperiment: null
    };

    const experimentPerformance = experiments.map(exp => {
      const responses = mockResponses.filter(resp => resp.experimentId === exp.id);
      const conversions = responses.filter(resp => resp.converted);
      const conversionRate = this.calculateConversionRate(responses.length, conversions.length);
      
      metrics.totalResponses += responses.length;
      metrics.totalConversions += conversions.length;
      
      return {
        id: exp.id,
        name: exp.name,
        responses: responses.length,
        conversions: conversions.length,
        conversionRate
      };
    });

    metrics.averageConversionRate = this.calculateConversionRate(metrics.totalResponses, metrics.totalConversions);

    if (experimentPerformance.length > 0) {
      experimentPerformance.sort((a, b) => b.conversionRate - a.conversionRate);
      metrics.bestPerformingExperiment = experimentPerformance[0];
      metrics.worstPerformingExperiment = experimentPerformance[experimentPerformance.length - 1];
    }

    return metrics;
  }

  /**
   * Validate batch experiment data
   */
  validateBatchExperimentData(data) {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Batch experiment name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Batch experiment name must be less than 100 characters';
    }

    if (data.description && data.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (data.type && !['parallel', 'sequential', 'scheduled'].includes(data.type)) {
      errors.type = 'Invalid batch type. Must be: parallel, sequential, or scheduled';
    }

    if (data.experiments && !Array.isArray(data.experiments)) {
      errors.experiments = 'Experiments must be an array';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Validate experiment IDs exist
   */
  async validateExperimentIds(experimentIds) {
    const missingExperiments = [];
    
    experimentIds.forEach(id => {
      const experiment = mockExperiments.find(exp => exp.id === id);
      if (!experiment) {
        missingExperiments.push(id);
      }
    });

    if (missingExperiments.length > 0) {
      throw new ValidationError({
        experiments: `Experiments not found: ${missingExperiments.join(', ')}`
      });
    }
  }

  /**
   * Validate batch name for uniqueness
   */
  validateBatchName(name, excludeId = null) {
    const existingBatch = mockBatchExperiments.find(batch => 
      batch.name.toLowerCase() === name.toLowerCase() && batch.id !== excludeId
    );

    if (existingBatch) {
      throw new ConflictError(`Batch experiment with name '${name}' already exists`);
    }
  }

  /**
   * Start all experiments in batch (parallel mode)
   */
  async startAllExperimentsInBatch(experimentIds) {
    // In a real implementation, this would call experiment service
    // For now, we'll just log the action
    console.log(`Starting experiments in parallel: ${experimentIds.join(', ')}`);
  }

  /**
   * Stop all experiments in batch
   */
  async stopAllExperimentsInBatch(experimentIds) {
    // In a real implementation, this would call experiment service
    console.log(`Stopping experiments: ${experimentIds.join(', ')}`);
  }

  /**
   * Start single experiment
   */
  async startExperiment(experimentId) {
    // In a real implementation, this would call experiment service
    console.log(`Starting experiment: ${experimentId}`);
  }

  /**
   * Schedule experiment start
   */
  async scheduleExperimentStart(batch) {
    // In a real implementation, this would set up scheduled tasks
    console.log(`Scheduling batch experiment: ${batch.id}`);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(responses, conversions) {
    if (!responses || responses === 0) return 0;
    return Math.round((conversions / responses) * 100 * 100) / 100;
  }
}

module.exports = new BatchExperimentService();
