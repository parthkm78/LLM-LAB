/**
 * @fileoverview Enhanced LLM Service
 * @description Production-ready LLM service with comprehensive error handling,
 * rate limiting, retries, and monitoring.
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');
const { ExternalAPIError, ConfigurationError, RateLimitError } = require('../utils/errors');

/**
 * Enhanced LLM Service Class
 * Provides robust OpenAI API integration with advanced features
 */
class LLMService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    this.mockMode = false;
    this.rateLimitTracker = new Map();
    this.requestQueue = [];
    this.processing = false;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
    
    this.init();
  }

  /**
   * Initialize the LLM service
   */
  init() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        logger.warn('No OpenAI API key provided, running in mock mode');
        this.mockMode = true;
        this.isInitialized = true;
        return;
      }

      this.openai = new OpenAI({
        apiKey: apiKey,
        timeout: 30000, // 30 seconds timeout
        maxRetries: 0   // We handle retries ourselves
      });

      this.mockMode = false;
      this.isInitialized = true;
      
      logger.info('LLM Service initialized successfully', { mockMode: this.mockMode });
    } catch (error) {
      logger.error('Failed to initialize LLM Service:', error);
      throw new ConfigurationError('LLM Service initialization failed', error);
    }
  }

  /**
   * Generate response with comprehensive parameter support
   * @param {string} prompt - Input prompt
   * @param {Object} parameters - LLM parameters
   * @returns {Promise<Object>} Generated response with metadata
   */
  async generateResponse(prompt, parameters = {}) {
    try {
      const startTime = Date.now();
      
      logger.info('Generating LLM response', { 
        promptLength: prompt.length,
        parameters,
        mockMode: this.mockMode 
      });

      // Validate inputs
      this._validateInputs(prompt, parameters);

      // Check rate limits
      await this._checkRateLimit();

      let response;
      
      if (this.mockMode) {
        response = await this._generateMockResponse(prompt, parameters);
      } else {
        response = await this._generateRealResponse(prompt, parameters);
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const result = {
        content: response.content,
        response_time: responseTime,
        usage: response.usage || null,
        model: parameters.model || 'gpt-3.5-turbo',
        parameters: {
          temperature: parameters.temperature || 0.7,
          top_p: parameters.top_p || 1.0,
          frequency_penalty: parameters.frequency_penalty || 0.0,
          presence_penalty: parameters.presence_penalty || 0.0,
          max_tokens: parameters.max_tokens || 150
        },
        metadata: {
          generated_at: new Date().toISOString(),
          mock_mode: this.mockMode,
          response_time_ms: responseTime
        }
      };

      logger.info('LLM response generated successfully', {
        responseLength: result.content.length,
        responseTime: `${responseTime}ms`,
        tokensUsed: result.usage?.total_tokens || 'unknown'
      });

      return result;
    } catch (error) {
      logger.error('Error generating LLM response:', error);
      throw this._handleAPIError(error);
    }
  }

  /**
   * Generate real response using OpenAI API
   * @private
   * @param {string} prompt - Input prompt
   * @param {Object} parameters - LLM parameters
   * @returns {Promise<Object>} API response
   */
  async _generateRealResponse(prompt, parameters) {
    const requestConfig = {
      model: parameters.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: parameters.temperature || 0.7,
      top_p: parameters.top_p || 1.0,
      frequency_penalty: parameters.frequency_penalty || 0.0,
      presence_penalty: parameters.presence_penalty || 0.0,
      max_tokens: parameters.max_tokens || 150
    };

    return await this._executeWithRetry(async () => {
      const response = await this.openai.chat.completions.create(requestConfig);
      
      return {
        content: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
    });
  }

  /**
   * Generate mock response for testing/development
   * @private
   * @param {string} prompt - Input prompt
   * @param {Object} parameters - LLM parameters
   * @returns {Promise<Object>} Mock response
   */
  async _generateMockResponse(prompt, parameters) {
    // Simulate realistic response time based on parameters
    const baseDelay = Math.random() * 1000 + 500; // 500-1500ms base
    const temperatureEffect = (parameters.temperature || 0.7) * 200; // Higher temp = slower
    const tokenEffect = (parameters.max_tokens || 150) * 2; // More tokens = slower
    const simulatedDelay = Math.min(baseDelay + temperatureEffect + tokenEffect, 5000);
    
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));

    // Generate mock content based on parameters
    const creativity = parameters.temperature || 0.7;
    const length = parameters.max_tokens || 150;
    
    const templates = [
      "This is a mock response generated for testing purposes. The original prompt was: '{prompt}'. This response demonstrates the LLM's ability to understand and respond to user queries.",
      "Based on the input prompt '{prompt}', here's a comprehensive analysis and response. This mock content varies based on the specified parameters to simulate realistic behavior.",
      "In response to '{prompt}', I can provide the following insights and information. This generated content reflects the temperature setting of {temperature} and demonstrates parameter-based variation.",
      "Thank you for the prompt: '{prompt}'. This mock response is generated with temperature {temperature} and top_p {top_p}, showcasing how different parameters affect output characteristics.",
      "Regarding your query '{prompt}', here's a detailed response. The creativity level is set to {temperature}, which influences the randomness and variety of this generated content."
    ];

    let mockContent = templates[Math.floor(Math.random() * templates.length)]
      .replace('{prompt}', prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''))
      .replace(/{temperature}/g, parameters.temperature || 0.7)
      .replace(/{top_p}/g, parameters.top_p || 1.0);

    // Adjust content length based on max_tokens
    const targetLength = Math.min(length * 4, 2000); // Rough character estimate
    while (mockContent.length < targetLength) {
      mockContent += " This additional content helps reach the target length specified by the max_tokens parameter.";
    }
    
    if (mockContent.length > targetLength) {
      mockContent = mockContent.substring(0, targetLength - 3) + '...';
    }

    // Add parameter-based variation
    if (creativity > 0.8) {
      mockContent += " 🚀 [High creativity mode: This response includes more creative and varied content!]";
    } else if (creativity < 0.3) {
      mockContent += " [Low temperature mode: This response is more focused and deterministic.]";
    }

    return {
      content: mockContent,
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: Math.ceil(mockContent.length / 4),
        total_tokens: Math.ceil((prompt.length + mockContent.length) / 4)
      }
    };
  }

  /**
   * Execute request with retry logic
   * @private
   * @param {Function} operation - Operation to execute
   * @returns {Promise<any>} Operation result
   */
  async _executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain error types
        if (error.status === 400 || error.status === 401 || error.status === 403) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );
        
        logger.warn(`API request failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          error: error.message
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Validate inputs
   * @private
   * @param {string} prompt - Input prompt
   * @param {Object} parameters - LLM parameters
   */
  _validateInputs(prompt, parameters) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    if (prompt.length > 100000) {
      throw new Error('Prompt is too long (max 100,000 characters)');
    }

    // Validate parameters
    if (parameters.temperature !== undefined) {
      if (typeof parameters.temperature !== 'number' || parameters.temperature < 0 || parameters.temperature > 2) {
        throw new Error('Temperature must be a number between 0 and 2');
      }
    }

    if (parameters.top_p !== undefined) {
      if (typeof parameters.top_p !== 'number' || parameters.top_p < 0 || parameters.top_p > 1) {
        throw new Error('Top P must be a number between 0 and 1');
      }
    }

    if (parameters.max_tokens !== undefined) {
      if (!Number.isInteger(parameters.max_tokens) || parameters.max_tokens < 1 || parameters.max_tokens > 8192) {
        throw new Error('Max tokens must be an integer between 1 and 8192');
      }
    }

    if (parameters.frequency_penalty !== undefined) {
      if (typeof parameters.frequency_penalty !== 'number' || parameters.frequency_penalty < -2 || parameters.frequency_penalty > 2) {
        throw new Error('Frequency penalty must be a number between -2 and 2');
      }
    }

    if (parameters.presence_penalty !== undefined) {
      if (typeof parameters.presence_penalty !== 'number' || parameters.presence_penalty < -2 || parameters.presence_penalty > 2) {
        throw new Error('Presence penalty must be a number between -2 and 2');
      }
    }
  }

  /**
   * Check rate limits
   * @private
   * @returns {Promise<void>}
   */
  async _checkRateLimit() {
    if (this.mockMode) {
      return; // No rate limiting in mock mode
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 50; // Max 50 requests per minute

    // Clean old entries
    for (const [timestamp] of this.rateLimitTracker) {
      if (now - timestamp > windowMs) {
        this.rateLimitTracker.delete(timestamp);
      }
    }

    // Check if we're under the limit
    if (this.rateLimitTracker.size >= maxRequests) {
      const oldestRequest = Math.min(...this.rateLimitTracker.keys());
      const waitTime = windowMs - (now - oldestRequest);
      
      logger.warn('Rate limit reached, waiting', { waitTime });
      throw new RateLimitError('Rate limit exceeded', waitTime);
    }

    // Add current request
    this.rateLimitTracker.set(now, true);
  }

  /**
   * Handle API errors
   * @private
   * @param {Error} error - Original error
   * @returns {Error} Handled error
   */
  _handleAPIError(error) {
    if (error.status) {
      switch (error.status) {
        case 400:
          return new ExternalAPIError('Invalid request to OpenAI API', 400, error.message);
        case 401:
          return new ExternalAPIError('Invalid OpenAI API key', 401, error.message);
        case 403:
          return new ExternalAPIError('OpenAI API access forbidden', 403, error.message);
        case 429:
          return new RateLimitError('OpenAI API rate limit exceeded', error.message);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ExternalAPIError('OpenAI API server error', error.status, error.message);
        default:
          return new ExternalAPIError('OpenAI API error', error.status, error.message);
      }
    }
    
    return new ExternalAPIError('Unexpected LLM service error', 500, error.message);
  }

  /**
   * Get service status and statistics
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      mock_mode: this.mockMode,
      rate_limit_status: {
        current_requests: this.rateLimitTracker.size,
        max_requests: 50,
        window_ms: 60000
      },
      retry_config: this.retryConfig,
      queue_length: this.requestQueue.length,
      processing: this.processing
    };
  }

  /**
   * Clear rate limit tracker (for testing)
   */
  clearRateLimit() {
    this.rateLimitTracker.clear();
  }

  /**
   * Set mock mode
   * @param {boolean} enabled - Whether to enable mock mode
   */
  setMockMode(enabled) {
    this.mockMode = enabled;
    logger.info('Mock mode changed', { mockMode: this.mockMode });
  }
}

// Create and export singleton instance
const llmService = new LLMService();
module.exports = llmService;
