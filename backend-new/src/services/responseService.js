/**
 * Response Service
 * 
 * Business logic layer for response management.
 * Handles CRUD operations, validations, and business rules for experiment responses.
 */

const mockResponses = require('../data/mockResponses');
const { 
  applyFiltering, 
  applyPagination, 
  applySorting 
} = require('../utils/helpers');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');

class ResponseService {
  /**
   * Get all responses with filtering, pagination, and sorting
   */
  async getAllResponses(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      experimentId,
      userId,
      variant,
      converted,
      dateFrom,
      dateTo,
      search
    } = options;

    let responses = [...mockResponses];

    // Apply filters
    const filters = {};
    if (experimentId) filters.experimentId = experimentId;
    if (userId) filters.userId = userId;
    if (variant) filters.variant = variant;
    if (converted !== undefined) filters.converted = converted === 'true';

    responses = applyFiltering(responses, filters);

    // Apply date range filtering
    if (dateFrom || dateTo) {
      responses = responses.filter(response => {
        const responseDate = new Date(response.timestamp);
        if (dateFrom && responseDate < new Date(dateFrom)) return false;
        if (dateTo && responseDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Apply search (search in response data)
    if (search) {
      const searchLower = search.toLowerCase();
      responses = responses.filter(response =>
        response.userId.toLowerCase().includes(searchLower) ||
        response.experimentId.toLowerCase().includes(searchLower) ||
        response.variant.toLowerCase().includes(searchLower) ||
        (response.metadata && JSON.stringify(response.metadata).toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    responses = applySorting(responses, sortBy, sortOrder);

    // Get total count before pagination
    const total = responses.length;

    // Apply pagination
    const paginatedResponses = applyPagination(responses, page, limit);

    return {
      responses: paginatedResponses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        experimentId,
        userId,
        variant,
        converted,
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
   * Get response by ID
   */
  async getResponseById(id) {
    const response = mockResponses.find(resp => resp.id === id);
    
    if (!response) {
      throw new NotFoundError('Response', id);
    }

    return response;
  }

  /**
   * Create new response
   */
  async createResponse(responseData) {
    // Validate required fields
    this.validateResponseData(responseData);

    // Check for duplicate response from same user to same experiment
    const existingResponse = mockResponses.find(resp => 
      resp.userId === responseData.userId && 
      resp.experimentId === responseData.experimentId
    );

    if (existingResponse) {
      throw new ConflictError(`User ${responseData.userId} has already responded to experiment ${responseData.experimentId}`);
    }

    // Generate new ID
    const newId = this.generateId();

    // Create response object
    const newResponse = {
      id: newId,
      experimentId: responseData.experimentId,
      userId: responseData.userId,
      variant: responseData.variant,
      converted: responseData.converted || false,
      responseData: responseData.responseData || {},
      metadata: responseData.metadata || {},
      timestamp: new Date().toISOString(),
      ipAddress: responseData.ipAddress,
      userAgent: responseData.userAgent,
      sessionId: responseData.sessionId
    };

    // Add to mock data
    mockResponses.push(newResponse);

    return newResponse;
  }

  /**
   * Update response
   */
  async updateResponse(id, updateData) {
    const response = await this.getResponseById(id);

    // Validate update data
    if (updateData.converted !== undefined && typeof updateData.converted !== 'boolean') {
      throw new ValidationError({
        converted: 'Converted field must be a boolean'
      });
    }

    // Apply updates
    const updatedResponse = {
      ...response,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update in mock data
    const index = mockResponses.findIndex(resp => resp.id === id);
    mockResponses[index] = updatedResponse;

    return updatedResponse;
  }

  /**
   * Delete response
   */
  async deleteResponse(id) {
    const response = await this.getResponseById(id);

    // Remove from mock data
    const index = mockResponses.findIndex(resp => resp.id === id);
    mockResponses.splice(index, 1);

    return { message: 'Response deleted successfully' };
  }

  /**
   * Get responses by experiment ID
   */
  async getResponsesByExperiment(experimentId, options = {}) {
    const filteredOptions = {
      ...options,
      experimentId
    };

    return await this.getAllResponses(filteredOptions);
  }

  /**
   * Get responses by user ID
   */
  async getResponsesByUser(userId, options = {}) {
    const filteredOptions = {
      ...options,
      userId
    };

    return await this.getAllResponses(filteredOptions);
  }

  /**
   * Get conversion stats for an experiment
   */
  async getConversionStats(experimentId) {
    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);

    if (responses.length === 0) {
      return {
        experimentId,
        totalResponses: 0,
        totalConversions: 0,
        conversionRate: 0,
        variants: []
      };
    }

    const totalResponses = responses.length;
    const totalConversions = responses.filter(resp => resp.converted).length;
    const conversionRate = this.calculateConversionRate(totalResponses, totalConversions);

    // Group by variants
    const variantStats = responses.reduce((acc, response) => {
      if (!acc[response.variant]) {
        acc[response.variant] = {
          variant: response.variant,
          responses: 0,
          conversions: 0,
          conversionRate: 0
        };
      }

      acc[response.variant].responses++;
      if (response.converted) {
        acc[response.variant].conversions++;
      }

      return acc;
    }, {});

    // Calculate conversion rates for variants
    Object.values(variantStats).forEach(variant => {
      variant.conversionRate = this.calculateConversionRate(variant.responses, variant.conversions);
    });

    return {
      experimentId,
      totalResponses,
      totalConversions,
      conversionRate,
      variants: Object.values(variantStats)
    };
  }

  /**
   * Get response timeline for an experiment
   */
  async getResponseTimeline(experimentId, granularity = 'day') {
    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);

    if (responses.length === 0) {
      return {
        experimentId,
        granularity,
        timeline: []
      };
    }

    // Group responses by time period
    const timeline = responses.reduce((acc, response) => {
      const date = new Date(response.timestamp);
      let timeKey;

      switch (granularity) {
        case 'hour':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          timeKey = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        default:
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      if (!acc[timeKey]) {
        acc[timeKey] = {
          period: timeKey,
          responses: 0,
          conversions: 0,
          conversionRate: 0
        };
      }

      acc[timeKey].responses++;
      if (response.converted) {
        acc[timeKey].conversions++;
      }

      return acc;
    }, {});

    // Calculate conversion rates and sort by period
    const timelineArray = Object.values(timeline)
      .map(period => ({
        ...period,
        conversionRate: this.calculateConversionRate(period.responses, period.conversions)
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      experimentId,
      granularity,
      timeline: timelineArray
    };
  }

  /**
   * Bulk create responses
   */
  async bulkCreateResponses(responsesData) {
    const createdResponses = [];
    const errors = [];

    for (let i = 0; i < responsesData.length; i++) {
      try {
        const response = await this.createResponse(responsesData[i]);
        createdResponses.push(response);
      } catch (error) {
        errors.push({
          index: i,
          data: responsesData[i],
          error: error.message
        });
      }
    }

    return {
      success: createdResponses.length,
      errors: errors.length,
      created: createdResponses,
      failed: errors
    };
  }

  /**
   * Export responses for an experiment
   */
  async exportResponses(experimentId, format = 'csv') {
    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);

    if (format === 'csv') {
      return this.convertToCSV(responses);
    } else if (format === 'json') {
      return responses;
    } else {
      throw new ValidationError({
        format: 'Supported formats are: csv, json'
      });
    }
  }

  /**
   * Convert responses to CSV format
   */
  convertToCSV(responses) {
    if (responses.length === 0) {
      return 'No data available';
    }

    const headers = [
      'id',
      'experimentId',
      'userId',
      'variant',
      'converted',
      'timestamp',
      'ipAddress',
      'userAgent',
      'sessionId'
    ];

    const csvRows = [
      headers.join(','),
      ...responses.map(response => {
        return headers.map(header => {
          const value = response[header];
          // Escape commas and quotes in values
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',');
      })
    ];

    return csvRows.join('\n');
  }

  /**
   * Validate response data
   */
  validateResponseData(data) {
    const errors = {};

    if (!data.experimentId || data.experimentId.trim().length === 0) {
      errors.experimentId = 'Experiment ID is required';
    }

    if (!data.userId || data.userId.trim().length === 0) {
      errors.userId = 'User ID is required';
    }

    if (!data.variant || data.variant.trim().length === 0) {
      errors.variant = 'Variant is required';
    }

    if (data.converted !== undefined && typeof data.converted !== 'boolean') {
      errors.converted = 'Converted field must be a boolean';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(responses, conversions) {
    if (!responses || responses === 0) return 0;
    return Math.round((conversions / responses) * 100 * 100) / 100; // Round to 2 decimal places
  }
}

module.exports = new ResponseService();
