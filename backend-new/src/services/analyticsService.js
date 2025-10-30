/**
 * Analytics Service
 * 
 * Business logic layer for analytics and reporting.
 * Handles data aggregation, metrics calculation, and insights generation.
 */

const mockAnalytics = require('../data/mockAnalytics');
const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');
const { 
  applyFiltering, 
  applyPagination, 
  applySorting 
} = require('../utils/helpers');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

class AnalyticsService {
  /**
   * Get dashboard overview data
   */
  async getDashboardOverview(userId = null) {
    let experiments = [...mockExperiments];
    let responses = [...mockResponses];

    // Filter by user if specified
    if (userId) {
      experiments = experiments.filter(exp => exp.createdBy === userId);
      const userExperimentIds = experiments.map(exp => exp.id);
      responses = responses.filter(resp => userExperimentIds.includes(resp.experimentId));
    }

    const totalExperiments = experiments.length;
    const activeExperiments = experiments.filter(exp => exp.status === 'running').length;
    const completedExperiments = experiments.filter(exp => exp.status === 'completed').length;
    const draftExperiments = experiments.filter(exp => exp.status === 'draft').length;

    const totalResponses = responses.length;
    const totalConversions = responses.filter(resp => resp.converted).length;
    const overallConversionRate = this.calculateConversionRate(totalResponses, totalConversions);

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentResponses = responses.filter(resp => new Date(resp.timestamp) >= sevenDaysAgo);
    const recentConversions = recentResponses.filter(resp => resp.converted);

    return {
      summary: {
        totalExperiments,
        activeExperiments,
        completedExperiments,
        draftExperiments,
        totalResponses,
        totalConversions,
        overallConversionRate
      },
      recentActivity: {
        responsesLast7Days: recentResponses.length,
        conversionsLast7Days: recentConversions.length,
        conversionRateLast7Days: this.calculateConversionRate(recentResponses.length, recentConversions.length)
      },
      trends: await this.getConversionTrends(30), // Last 30 days
      topPerformingExperiments: await this.getTopPerformingExperiments(5, userId)
    };
  }

  /**
   * Get experiment performance metrics
   */
  async getExperimentPerformance(experimentId) {
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      throw new NotFoundError('Experiment', experimentId);
    }

    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);
    
    if (responses.length === 0) {
      return {
        experimentId,
        experimentName: experiment.name,
        status: experiment.status,
        totalResponses: 0,
        totalConversions: 0,
        conversionRate: 0,
        variants: [],
        timeline: [],
        statisticalSignificance: null
      };
    }

    const totalResponses = responses.length;
    const totalConversions = responses.filter(resp => resp.converted).length;
    const conversionRate = this.calculateConversionRate(totalResponses, totalConversions);

    // Variant performance
    const variantPerformance = this.calculateVariantPerformance(responses);

    // Response timeline
    const timeline = this.generateResponseTimeline(responses);

    // Statistical significance
    const statisticalSignificance = this.calculateStatisticalSignificance(variantPerformance);

    return {
      experimentId,
      experimentName: experiment.name,
      status: experiment.status,
      totalResponses,
      totalConversions,
      conversionRate,
      variants: variantPerformance,
      timeline,
      statisticalSignificance,
      startDate: experiment.createdAt,
      duration: this.calculateDuration(experiment.createdAt, experiment.completedAt)
    };
  }

  /**
   * Get conversion trends over time
   */
  async getConversionTrends(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const responses = mockResponses.filter(resp => new Date(resp.timestamp) >= startDate);

    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResponses = responses.filter(resp => {
        const respDate = new Date(resp.timestamp).toISOString().split('T')[0];
        return respDate === dateStr;
      });

      const dayConversions = dayResponses.filter(resp => resp.converted);

      trends.push({
        date: dateStr,
        responses: dayResponses.length,
        conversions: dayConversions.length,
        conversionRate: this.calculateConversionRate(dayResponses.length, dayConversions.length)
      });
    }

    return trends;
  }

  /**
   * Get top performing experiments
   */
  async getTopPerformingExperiments(limit = 10, userId = null) {
    let experiments = [...mockExperiments];

    // Filter by user if specified
    if (userId) {
      experiments = experiments.filter(exp => exp.createdBy === userId);
    }

    const experimentPerformance = experiments.map(experiment => {
      const responses = mockResponses.filter(resp => resp.experimentId === experiment.id);
      const conversions = responses.filter(resp => resp.converted);
      
      return {
        id: experiment.id,
        name: experiment.name,
        status: experiment.status,
        responses: responses.length,
        conversions: conversions.length,
        conversionRate: this.calculateConversionRate(responses.length, conversions.length),
        createdAt: experiment.createdAt
      };
    });

    // Sort by conversion rate (then by response count for tie-breaking)
    experimentPerformance.sort((a, b) => {
      if (b.conversionRate !== a.conversionRate) {
        return b.conversionRate - a.conversionRate;
      }
      return b.responses - a.responses;
    });

    return experimentPerformance.slice(0, limit);
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(userId) {
    const userResponses = mockResponses.filter(resp => resp.userId === userId);
    
    if (userResponses.length === 0) {
      return {
        userId,
        totalResponses: 0,
        totalConversions: 0,
        conversionRate: 0,
        experimentsParticipated: 0,
        firstInteraction: null,
        lastInteraction: null,
        averageTimeToConversion: null
      };
    }

    const totalResponses = userResponses.length;
    const totalConversions = userResponses.filter(resp => resp.converted).length;
    const conversionRate = this.calculateConversionRate(totalResponses, totalConversions);
    
    const experimentsParticipated = new Set(userResponses.map(resp => resp.experimentId)).size;
    
    const timestamps = userResponses.map(resp => new Date(resp.timestamp));
    const firstInteraction = new Date(Math.min(...timestamps));
    const lastInteraction = new Date(Math.max(...timestamps));

    return {
      userId,
      totalResponses,
      totalConversions,
      conversionRate,
      experimentsParticipated,
      firstInteraction: firstInteraction.toISOString(),
      lastInteraction: lastInteraction.toISOString(),
      engagementScore: this.calculateEngagementScore(userResponses)
    };
  }

  /**
   * Get A/B test comparison
   */
  async getABTestComparison(experimentId) {
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      throw new NotFoundError('Experiment', experimentId);
    }

    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);
    const variantPerformance = this.calculateVariantPerformance(responses);

    if (variantPerformance.length < 2) {
      return {
        experimentId,
        error: 'A/B test comparison requires at least 2 variants'
      };
    }

    // Sort variants by conversion rate
    variantPerformance.sort((a, b) => b.conversionRate - a.conversionRate);

    const control = variantPerformance[0];
    const variant = variantPerformance[1];

    const improvement = control.conversionRate > 0 
      ? ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100 
      : 0;

    const confidence = this.calculateConfidenceInterval(control, variant);

    return {
      experimentId,
      control: {
        name: control.variant,
        responses: control.responses,
        conversions: control.conversions,
        conversionRate: control.conversionRate
      },
      variant: {
        name: variant.variant,
        responses: variant.responses,
        conversions: variant.conversions,
        conversionRate: variant.conversionRate
      },
      comparison: {
        improvement: Math.round(improvement * 100) / 100,
        isStatisticallySignificant: confidence.isSignificant,
        confidenceLevel: confidence.level,
        winner: control.conversionRate >= variant.conversionRate ? control.variant : variant.variant
      }
    };
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(options = {}) {
    const {
      dateFrom,
      dateTo,
      experimentIds,
      userIds,
      includeMetrics = true,
      includeTrends = true,
      includeVariants = true
    } = options;

    let responses = [...mockResponses];
    let experiments = [...mockExperiments];

    // Apply filters
    if (dateFrom) {
      responses = responses.filter(resp => new Date(resp.timestamp) >= new Date(dateFrom));
    }
    if (dateTo) {
      responses = responses.filter(resp => new Date(resp.timestamp) <= new Date(dateTo));
    }
    if (experimentIds && experimentIds.length > 0) {
      responses = responses.filter(resp => experimentIds.includes(resp.experimentId));
      experiments = experiments.filter(exp => experimentIds.includes(exp.id));
    }
    if (userIds && userIds.length > 0) {
      responses = responses.filter(resp => userIds.includes(resp.userId));
    }

    const report = {
      reportGenerated: new Date().toISOString(),
      filters: { dateFrom, dateTo, experimentIds, userIds },
      summary: {
        totalExperiments: experiments.length,
        totalResponses: responses.length,
        totalConversions: responses.filter(resp => resp.converted).length,
        overallConversionRate: this.calculateConversionRate(
          responses.length,
          responses.filter(resp => resp.converted).length
        )
      }
    };

    if (includeMetrics) {
      report.metrics = await this.calculateDetailedMetrics(responses, experiments);
    }

    if (includeTrends) {
      report.trends = this.generateResponseTimeline(responses);
    }

    if (includeVariants) {
      report.variantPerformance = this.calculateVariantPerformance(responses);
    }

    return report;
  }

  /**
   * Calculate variant performance
   */
  calculateVariantPerformance(responses) {
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

    // Calculate conversion rates
    Object.values(variantStats).forEach(variant => {
      variant.conversionRate = this.calculateConversionRate(variant.responses, variant.conversions);
    });

    return Object.values(variantStats);
  }

  /**
   * Generate response timeline
   */
  generateResponseTimeline(responses, granularity = 'day') {
    const timeline = responses.reduce((acc, response) => {
      const date = new Date(response.timestamp);
      const timeKey = date.toISOString().split('T')[0]; // Daily granularity

      if (!acc[timeKey]) {
        acc[timeKey] = {
          date: timeKey,
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

    // Calculate conversion rates and sort
    return Object.values(timeline)
      .map(day => ({
        ...day,
        conversionRate: this.calculateConversionRate(day.responses, day.conversions)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate statistical significance
   */
  calculateStatisticalSignificance(variants) {
    if (variants.length < 2) return null;

    // Simplified statistical significance calculation
    // In production, use proper statistical tests (chi-square, z-test, etc.)
    const totalSampleSize = variants.reduce((sum, v) => sum + v.responses, 0);
    
    if (totalSampleSize < 100) {
      return {
        isSignificant: false,
        confidence: 'low',
        message: 'Sample size too small for reliable results'
      };
    }

    const maxConversionRate = Math.max(...variants.map(v => v.conversionRate));
    const minConversionRate = Math.min(...variants.map(v => v.conversionRate));
    const difference = maxConversionRate - minConversionRate;

    return {
      isSignificant: difference > 2 && totalSampleSize > 1000,
      confidence: totalSampleSize > 1000 ? 'high' : 'medium',
      sampleSize: totalSampleSize,
      difference: Math.round(difference * 100) / 100
    };
  }

  /**
   * Calculate confidence interval
   */
  calculateConfidenceInterval(control, variant) {
    // Simplified confidence calculation
    const totalSamples = control.responses + variant.responses;
    
    if (totalSamples < 100) {
      return {
        isSignificant: false,
        level: 'low',
        message: 'Insufficient sample size'
      };
    }

    const difference = Math.abs(control.conversionRate - variant.conversionRate);
    
    return {
      isSignificant: difference > 2 && totalSamples > 1000,
      level: totalSamples > 1000 ? '95%' : '80%',
      difference: Math.round(difference * 100) / 100
    };
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(userResponses) {
    // Simple engagement scoring algorithm
    const totalResponses = userResponses.length;
    const conversions = userResponses.filter(resp => resp.converted).length;
    const experiments = new Set(userResponses.map(resp => resp.experimentId)).size;
    
    const responseScore = Math.min(totalResponses * 10, 50);
    const conversionScore = conversions * 20;
    const diversityScore = experiments * 5;

    return Math.min(responseScore + conversionScore + diversityScore, 100);
  }

  /**
   * Calculate detailed metrics
   */
  async calculateDetailedMetrics(responses, experiments) {
    const metrics = {
      responseMetrics: {
        totalResponses: responses.length,
        uniqueUsers: new Set(responses.map(resp => resp.userId)).size,
        averageResponsesPerUser: 0,
        averageResponsesPerExperiment: 0
      },
      conversionMetrics: {
        totalConversions: responses.filter(resp => resp.converted).length,
        overallConversionRate: 0,
        averageConversionRate: 0
      },
      timeMetrics: {
        responseFrequency: this.calculateResponseFrequency(responses),
        peakHours: this.calculatePeakHours(responses)
      }
    };

    // Calculate averages
    const uniqueUsers = metrics.responseMetrics.uniqueUsers;
    if (uniqueUsers > 0) {
      metrics.responseMetrics.averageResponsesPerUser = 
        Math.round((responses.length / uniqueUsers) * 100) / 100;
    }

    if (experiments.length > 0) {
      metrics.responseMetrics.averageResponsesPerExperiment = 
        Math.round((responses.length / experiments.length) * 100) / 100;
    }

    metrics.conversionMetrics.overallConversionRate = 
      this.calculateConversionRate(responses.length, metrics.conversionMetrics.totalConversions);

    return metrics;
  }

  /**
   * Calculate response frequency
   */
  calculateResponseFrequency(responses) {
    const frequency = {
      daily: 0,
      weekly: 0,
      monthly: 0
    };

    if (responses.length === 0) return frequency;

    const timestamps = responses.map(resp => new Date(resp.timestamp));
    const earliestDate = new Date(Math.min(...timestamps));
    const latestDate = new Date(Math.max(...timestamps));
    
    const daysDiff = Math.max(1, (latestDate - earliestDate) / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.max(1, daysDiff / 7);
    const monthsDiff = Math.max(1, daysDiff / 30);

    frequency.daily = Math.round((responses.length / daysDiff) * 100) / 100;
    frequency.weekly = Math.round((responses.length / weeksDiff) * 100) / 100;
    frequency.monthly = Math.round((responses.length / monthsDiff) * 100) / 100;

    return frequency;
  }

  /**
   * Calculate peak hours
   */
  calculatePeakHours(responses) {
    const hourCounts = new Array(24).fill(0);

    responses.forEach(response => {
      const hour = new Date(response.timestamp).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count === maxCount)
      .map(({ hour }) => hour);

    return peakHours;
  }

  /**
   * Calculate duration
   */
  calculateDuration(startDate, endDate = null) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const durationMs = end - start;
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    
    return {
      days,
      hours: Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      totalHours: Math.floor(durationMs / (1000 * 60 * 60)),
      humanReadable: days > 0 ? `${days} days` : `${Math.floor(durationMs / (1000 * 60 * 60))} hours`
    };
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(responses, conversions) {
    if (!responses || responses === 0) return 0;
    return Math.round((conversions / responses) * 100 * 100) / 100;
  }
}

module.exports = new AnalyticsService();
