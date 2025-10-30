/**
 * Metrics Service
 * 
 * Business logic layer for metrics collection, calculation, and analysis.
 * Handles performance metrics, statistical analysis, and data insights.
 */

const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');
const mockBatchExperiments = require('../data/mockBatchExperiments');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

class MetricsService {
  /**
   * Get system-wide metrics
   */
  async getSystemMetrics() {
    const experiments = mockExperiments;
    const responses = mockResponses;
    const batches = mockBatchExperiments;

    const totalExperiments = experiments.length;
    const activeExperiments = experiments.filter(exp => exp.status === 'running').length;
    const totalResponses = responses.length;
    const totalConversions = responses.filter(resp => resp.converted).length;

    // Calculate time-based metrics
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const responsesLast24h = responses.filter(resp => new Date(resp.timestamp) >= last24Hours).length;
    const responsesLast7d = responses.filter(resp => new Date(resp.timestamp) >= last7Days).length;
    const responsesLast30d = responses.filter(resp => new Date(resp.timestamp) >= last30Days).length;

    const conversionsLast24h = responses.filter(resp => 
      resp.converted && new Date(resp.timestamp) >= last24Hours
    ).length;

    return {
      system: {
        totalExperiments,
        activeExperiments,
        totalBatches: batches.length,
        totalResponses,
        totalConversions,
        overallConversionRate: this.calculateConversionRate(totalResponses, totalConversions),
        uniqueUsers: new Set(responses.map(resp => resp.userId)).size
      },
      timeBasedMetrics: {
        last24Hours: {
          responses: responsesLast24h,
          conversions: conversionsLast24h,
          conversionRate: this.calculateConversionRate(responsesLast24h, conversionsLast24h)
        },
        last7Days: {
          responses: responsesLast7d,
          conversions: responses.filter(resp => 
            resp.converted && new Date(resp.timestamp) >= last7Days
          ).length
        },
        last30Days: {
          responses: responsesLast30d,
          conversions: responses.filter(resp => 
            resp.converted && new Date(resp.timestamp) >= last30Days
          ).length
        }
      },
      performance: await this.getSystemPerformanceMetrics()
    };
  }

  /**
   * Get experiment-specific metrics
   */
  async getExperimentMetrics(experimentId) {
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      throw new NotFoundError('Experiment', experimentId);
    }

    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);
    const conversions = responses.filter(resp => resp.converted);

    // Basic metrics
    const basicMetrics = {
      experimentId,
      experimentName: experiment.name,
      status: experiment.status,
      totalResponses: responses.length,
      totalConversions: conversions.length,
      conversionRate: this.calculateConversionRate(responses.length, conversions.length),
      uniqueUsers: new Set(responses.map(resp => resp.userId)).size
    };

    // Variant metrics
    const variantMetrics = this.calculateVariantMetrics(responses);

    // Statistical metrics
    const statisticalMetrics = await this.calculateStatisticalMetrics(responses, variantMetrics);

    // Time-based metrics
    const timeMetrics = this.calculateTimeMetrics(responses);

    // Segment metrics
    const segmentMetrics = this.calculateSegmentMetrics(responses);

    return {
      basic: basicMetrics,
      variants: variantMetrics,
      statistical: statisticalMetrics,
      time: timeMetrics,
      segments: segmentMetrics,
      insights: await this.generateExperimentInsights(experiment, responses)
    };
  }

  /**
   * Calculate real-time metrics
   */
  async getRealTimeMetrics(timeWindow = '1h') {
    const now = new Date();
    let windowStart;

    switch (timeWindow) {
      case '15m':
        windowStart = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case '1h':
        windowStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        windowStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        windowStart = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const recentResponses = mockResponses.filter(resp => 
      new Date(resp.timestamp) >= windowStart
    );

    const recentConversions = recentResponses.filter(resp => resp.converted);

    // Real-time experiment activity
    const experimentActivity = this.calculateExperimentActivity(recentResponses);

    // Response rate trends
    const responseTrends = this.calculateResponseTrends(recentResponses, timeWindow);

    return {
      timeWindow,
      windowStart: windowStart.toISOString(),
      windowEnd: now.toISOString(),
      summary: {
        totalResponses: recentResponses.length,
        totalConversions: recentConversions.length,
        conversionRate: this.calculateConversionRate(recentResponses.length, recentConversions.length),
        uniqueUsers: new Set(recentResponses.map(resp => resp.userId)).size,
        activeExperiments: new Set(recentResponses.map(resp => resp.experimentId)).size
      },
      experimentActivity,
      trends: responseTrends
    };
  }

  /**
   * Calculate cohort metrics
   */
  async getCohortMetrics(cohortType = 'weekly', startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const responses = mockResponses.filter(resp => {
      const respDate = new Date(resp.timestamp);
      return respDate >= start && respDate <= end;
    });

    const cohorts = this.groupResponsesByCohort(responses, cohortType);
    const cohortAnalysis = this.analyzeCohorts(cohorts);

    return {
      cohortType,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      cohorts: cohortAnalysis,
      insights: this.generateCohortInsights(cohortAnalysis)
    };
  }

  /**
   * Calculate funnel metrics
   */
  async getFunnelMetrics(experimentId, funnelSteps = ['view', 'interact', 'convert']) {
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      throw new NotFoundError('Experiment', experimentId);
    }

    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);

    // Simulate funnel data (in real app, this would come from actual funnel tracking)
    const funnelData = this.calculateFunnelData(responses, funnelSteps);
    const funnelAnalysis = this.analyzeFunnel(funnelData);

    return {
      experimentId,
      funnelSteps,
      funnelData,
      analysis: funnelAnalysis,
      dropoffPoints: this.identifyDropoffPoints(funnelData)
    };
  }

  /**
   * Get advanced statistical metrics
   */
  async getAdvancedStatistics(experimentId) {
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) {
      throw new NotFoundError('Experiment', experimentId);
    }

    const responses = mockResponses.filter(resp => resp.experimentId === experimentId);
    const variants = this.calculateVariantMetrics(responses);

    if (variants.length < 2) {
      return {
        error: 'Statistical analysis requires at least 2 variants'
      };
    }

    // Statistical significance testing
    const significance = this.calculateStatisticalSignificance(variants);

    // Confidence intervals
    const confidenceIntervals = this.calculateConfidenceIntervals(variants);

    // Effect size
    const effectSize = this.calculateEffectSize(variants);

    // Power analysis
    const powerAnalysis = this.calculatePowerAnalysis(variants);

    return {
      experimentId,
      variants: variants.map(variant => ({
        ...variant,
        confidenceInterval: confidenceIntervals[variant.variant],
        effectSize: effectSize[variant.variant]
      })),
      significance,
      powerAnalysis,
      recommendations: this.generateStatisticalRecommendations(significance, powerAnalysis)
    };
  }

  /**
   * Calculate variant metrics
   */
  calculateVariantMetrics(responses) {
    const variantData = responses.reduce((acc, response) => {
      if (!acc[response.variant]) {
        acc[response.variant] = {
          variant: response.variant,
          responses: 0,
          conversions: 0,
          users: new Set()
        };
      }

      acc[response.variant].responses++;
      acc[response.variant].users.add(response.userId);
      
      if (response.converted) {
        acc[response.variant].conversions++;
      }

      return acc;
    }, {});

    return Object.values(variantData).map(variant => ({
      variant: variant.variant,
      responses: variant.responses,
      conversions: variant.conversions,
      uniqueUsers: variant.users.size,
      conversionRate: this.calculateConversionRate(variant.responses, variant.conversions),
      usersPerResponse: variant.responses > 0 ? variant.users.size / variant.responses : 0
    }));
  }

  /**
   * Calculate statistical metrics
   */
  async calculateStatisticalMetrics(responses, variants) {
    if (variants.length < 2) {
      return {
        error: 'Statistical analysis requires at least 2 variants'
      };
    }

    const totalSampleSize = responses.length;
    const averageConversionRate = variants.reduce((sum, v) => sum + v.conversionRate, 0) / variants.length;

    // Standard deviation
    const variance = variants.reduce((sum, v) => {
      return sum + Math.pow(v.conversionRate - averageConversionRate, 2);
    }, 0) / variants.length;
    const standardDeviation = Math.sqrt(variance);

    // Statistical significance (simplified chi-square test)
    const significance = this.performChiSquareTest(variants);

    return {
      sampleSize: totalSampleSize,
      averageConversionRate,
      standardDeviation: Math.round(standardDeviation * 10000) / 10000,
      variance: Math.round(variance * 10000) / 10000,
      significance,
      confidenceLevel: this.determineConfidenceLevel(totalSampleSize, significance),
      recommendations: this.generateStatisticalRecommendations(significance, totalSampleSize)
    };
  }

  /**
   * Calculate time-based metrics
   */
  calculateTimeMetrics(responses) {
    if (responses.length === 0) {
      return {
        error: 'No responses to analyze'
      };
    }

    const timestamps = responses.map(resp => new Date(resp.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    const duration = latest - earliest;

    // Response distribution by hour
    const hourlyDistribution = new Array(24).fill(0);
    responses.forEach(resp => {
      const hour = new Date(resp.timestamp).getHours();
      hourlyDistribution[hour]++;
    });

    // Daily response trends
    const dailyTrends = this.calculateDailyTrends(responses);

    // Peak activity analysis
    const peakHours = this.findPeakHours(hourlyDistribution);

    return {
      duration: {
        milliseconds: duration,
        days: Math.floor(duration / (1000 * 60 * 60 * 24)),
        hours: Math.floor(duration / (1000 * 60 * 60))
      },
      timeRange: {
        start: earliest.toISOString(),
        end: latest.toISOString()
      },
      hourlyDistribution,
      dailyTrends,
      peakHours,
      responseVelocity: this.calculateResponseVelocity(responses)
    };
  }

  /**
   * Calculate segment metrics
   */
  calculateSegmentMetrics(responses) {
    // Segment by user behavior patterns
    const segments = {
      firstTimeUsers: responses.filter(resp => this.isFirstTimeUser(resp.userId, responses)),
      returningUsers: responses.filter(resp => !this.isFirstTimeUser(resp.userId, responses)),
      highEngagement: responses.filter(resp => this.isHighEngagementUser(resp.userId, responses)),
      lowEngagement: responses.filter(resp => !this.isHighEngagementUser(resp.userId, responses))
    };

    const segmentAnalysis = {};
    Object.keys(segments).forEach(segmentName => {
      const segmentResponses = segments[segmentName];
      const segmentConversions = segmentResponses.filter(resp => resp.converted);
      
      segmentAnalysis[segmentName] = {
        responses: segmentResponses.length,
        conversions: segmentConversions.length,
        conversionRate: this.calculateConversionRate(segmentResponses.length, segmentConversions.length),
        uniqueUsers: new Set(segmentResponses.map(resp => resp.userId)).size
      };
    });

    return segmentAnalysis;
  }

  /**
   * Generate experiment insights
   */
  async generateExperimentInsights(experiment, responses) {
    const insights = [];

    // Performance insights
    if (responses.length > 0) {
      const conversionRate = this.calculateConversionRate(
        responses.length,
        responses.filter(resp => resp.converted).length
      );

      if (conversionRate > 10) {
        insights.push({
          type: 'positive',
          category: 'performance',
          message: `High conversion rate of ${conversionRate}% indicates strong experiment performance`,
          severity: 'info'
        });
      } else if (conversionRate < 2) {
        insights.push({
          type: 'warning',
          category: 'performance',
          message: `Low conversion rate of ${conversionRate}% may indicate issues with the experiment`,
          severity: 'warning'
        });
      }
    }

    // Sample size insights
    if (responses.length < 100) {
      insights.push({
        type: 'warning',
        category: 'sample_size',
        message: 'Small sample size may lead to unreliable results. Consider running the experiment longer.',
        severity: 'warning'
      });
    }

    // Variant distribution insights
    const variants = this.calculateVariantMetrics(responses);
    if (variants.length > 1) {
      const maxResponses = Math.max(...variants.map(v => v.responses));
      const minResponses = Math.min(...variants.map(v => v.responses));
      
      if (maxResponses / minResponses > 2) {
        insights.push({
          type: 'warning',
          category: 'distribution',
          message: 'Uneven traffic distribution between variants may affect result reliability',
          severity: 'warning'
        });
      }
    }

    return insights;
  }

  /**
   * Calculate system performance metrics
   */
  async getSystemPerformanceMetrics() {
    const experiments = mockExperiments;
    const responses = mockResponses;

    // Calculate average response time (simulated)
    const avgResponseTime = 150 + Math.random() * 50; // 150-200ms

    // Calculate throughput
    const last1Hour = new Date(Date.now() - 60 * 60 * 1000);
    const recentResponses = responses.filter(resp => new Date(resp.timestamp) >= last1Hour);
    const throughput = recentResponses.length; // responses per hour

    // Error rate (simulated)
    const errorRate = Math.random() * 0.02; // 0-2% error rate

    return {
      responseTime: {
        average: Math.round(avgResponseTime),
        p95: Math.round(avgResponseTime * 1.5),
        p99: Math.round(avgResponseTime * 2)
      },
      throughput: {
        responsesPerHour: throughput,
        responsesPerMinute: Math.round(throughput / 60)
      },
      errorRate: Math.round(errorRate * 10000) / 100, // percentage with 2 decimal places
      uptime: 99.9 + Math.random() * 0.1 // 99.9-100% uptime
    };
  }

  /**
   * Helper methods
   */
  calculateConversionRate(responses, conversions) {
    if (!responses || responses === 0) return 0;
    return Math.round((conversions / responses) * 100 * 100) / 100;
  }

  calculateExperimentActivity(responses) {
    const activity = {};
    responses.forEach(resp => {
      if (!activity[resp.experimentId]) {
        activity[resp.experimentId] = {
          experimentId: resp.experimentId,
          responses: 0,
          conversions: 0,
          uniqueUsers: new Set()
        };
      }
      
      activity[resp.experimentId].responses++;
      activity[resp.experimentId].uniqueUsers.add(resp.userId);
      
      if (resp.converted) {
        activity[resp.experimentId].conversions++;
      }
    });

    return Object.values(activity).map(exp => ({
      experimentId: exp.experimentId,
      responses: exp.responses,
      conversions: exp.conversions,
      uniqueUsers: exp.uniqueUsers.size,
      conversionRate: this.calculateConversionRate(exp.responses, exp.conversions)
    }));
  }

  calculateResponseTrends(responses, timeWindow) {
    // Calculate trends based on time window
    const intervals = timeWindow === '15m' ? 15 : timeWindow === '1h' ? 6 : 24;
    const intervalSize = timeWindow === '15m' ? 1 : timeWindow === '1h' ? 10 : 60; // minutes

    const trends = [];
    const now = new Date();

    for (let i = intervals - 1; i >= 0; i--) {
      const intervalEnd = new Date(now.getTime() - i * intervalSize * 60 * 1000);
      const intervalStart = new Date(intervalEnd.getTime() - intervalSize * 60 * 1000);

      const intervalResponses = responses.filter(resp => {
        const respTime = new Date(resp.timestamp);
        return respTime >= intervalStart && respTime < intervalEnd;
      });

      trends.push({
        start: intervalStart.toISOString(),
        end: intervalEnd.toISOString(),
        responses: intervalResponses.length,
        conversions: intervalResponses.filter(resp => resp.converted).length
      });
    }

    return trends;
  }

  performChiSquareTest(variants) {
    // Simplified chi-square test for statistical significance
    if (variants.length < 2) return { isSignificant: false, pValue: 1 };

    const totalResponses = variants.reduce((sum, v) => sum + v.responses, 0);
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    const overallRate = totalConversions / totalResponses;

    let chiSquare = 0;
    variants.forEach(variant => {
      const expected = variant.responses * overallRate;
      const observed = variant.conversions;
      chiSquare += Math.pow(observed - expected, 2) / expected;
    });

    // Simplified p-value calculation (normally would use proper distribution)
    const pValue = chiSquare > 3.841 ? 0.05 : 0.1; // Simplified for demo

    return {
      isSignificant: chiSquare > 3.841, // Critical value for p=0.05, df=1
      pValue,
      chiSquare: Math.round(chiSquare * 1000) / 1000
    };
  }

  determineConfidenceLevel(sampleSize, significance) {
    if (sampleSize < 100) return 'low';
    if (sampleSize < 1000) return 'medium';
    if (significance.isSignificant) return 'high';
    return 'medium';
  }

  isFirstTimeUser(userId, allResponses) {
    const userResponses = allResponses.filter(resp => resp.userId === userId);
    return userResponses.length === 1;
  }

  isHighEngagementUser(userId, allResponses) {
    const userResponses = allResponses.filter(resp => resp.userId === userId);
    return userResponses.length > 3;
  }

  calculateDailyTrends(responses) {
    const dailyData = {};
    
    responses.forEach(resp => {
      const date = new Date(resp.timestamp).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { responses: 0, conversions: 0 };
      }
      dailyData[date].responses++;
      if (resp.converted) {
        dailyData[date].conversions++;
      }
    });

    return Object.keys(dailyData)
      .sort()
      .map(date => ({
        date,
        responses: dailyData[date].responses,
        conversions: dailyData[date].conversions,
        conversionRate: this.calculateConversionRate(
          dailyData[date].responses,
          dailyData[date].conversions
        )
      }));
  }

  findPeakHours(hourlyDistribution) {
    const maxCount = Math.max(...hourlyDistribution);
    return hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count === maxCount)
      .map(({ hour }) => hour);
  }

  calculateResponseVelocity(responses) {
    if (responses.length < 2) return 0;

    const timestamps = responses.map(resp => new Date(resp.timestamp)).sort();
    const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
    const hours = totalDuration / (1000 * 60 * 60);

    return hours > 0 ? Math.round((responses.length / hours) * 100) / 100 : 0;
  }

  groupResponsesByCohort(responses, cohortType) {
    // Implementation for cohort grouping would go here
    return {};
  }

  analyzeCohorts(cohorts) {
    // Implementation for cohort analysis would go here
    return [];
  }

  generateCohortInsights(analysis) {
    // Implementation for cohort insights would go here
    return [];
  }

  calculateFunnelData(responses, steps) {
    // Implementation for funnel calculation would go here
    return steps.map(step => ({ step, count: Math.floor(responses.length * Math.random()) }));
  }

  analyzeFunnel(funnelData) {
    // Implementation for funnel analysis would go here
    return {};
  }

  identifyDropoffPoints(funnelData) {
    // Implementation for dropoff identification would go here
    return [];
  }

  calculateStatisticalSignificance(variants) {
    return this.performChiSquareTest(variants);
  }

  calculateConfidenceIntervals(variants) {
    // Implementation for confidence intervals would go here
    return {};
  }

  calculateEffectSize(variants) {
    // Implementation for effect size calculation would go here
    return {};
  }

  calculatePowerAnalysis(variants) {
    // Implementation for power analysis would go here
    return {};
  }

  generateStatisticalRecommendations(significance, sampleSizeOrPowerAnalysis) {
    const recommendations = [];
    
    if (typeof sampleSizeOrPowerAnalysis === 'number' && sampleSizeOrPowerAnalysis < 1000) {
      recommendations.push('Increase sample size for more reliable results');
    }
    
    if (!significance.isSignificant) {
      recommendations.push('Results are not statistically significant. Consider running the experiment longer.');
    }
    
    return recommendations;
  }
}

module.exports = new MetricsService();
