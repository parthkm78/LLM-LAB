const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai';
    this.openai = null;
    this.googleAI = null;
    this.isMockMode = false;
    this.lastRequestTime = 0;
    this.requestInterval = 1000; // 1 second between requests for rate limiting
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    this.init();
  }

  init() {
    console.log(`🤖 Initializing LLM Service with provider: ${this.provider}`);
    
    try {
      if (this.provider === 'openai') {
        this.initializeOpenAI();
      } else if (this.provider === 'google') {
        this.initializeGoogleAI();
      } else {
        console.warn(`⚠️ Unknown LLM provider: ${this.provider}. Falling back to mock mode.`);
        this.isMockMode = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize LLM Service:', error.message);
      console.log('🎭 Falling back to mock mode');
      this.isMockMode = true;
    }
  }

  initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      console.warn('⚠️ OpenAI API key not configured. Using mock mode.');
      this.isMockMode = true;
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey
    });

    console.log('✅ OpenAI client initialized successfully');
  }

  initializeGoogleAI() {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-ai-studio-api-key-here') {
      console.warn('⚠️ Google AI Studio API key not configured. Using mock mode.');
      this.isMockMode = true;
      return;
    }

    this.googleAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Google AI Studio client initialized successfully');
  }

  async generateResponse(prompt, parameters = {}) {
    if (this.isMockMode) {
      console.log('🎭 Using mock mode for response generation');
      return await this.generateMockResponse(prompt, parameters);
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestInterval) {
      const waitTime = this.requestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();

    // Retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (this.provider === 'openai') {
          return await this.generateOpenAIResponse(prompt, parameters);
        } else if (this.provider === 'google') {
          return await this.generateGoogleAIResponse(prompt, parameters);
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          console.log('🎭 All attempts failed, falling back to mock mode');
          return await this.generateMockResponse(prompt, parameters);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async generateOpenAIResponse(prompt, parameters = {}) {
    const {
      temperature = 0.7,
      top_p = 1.0,
      frequency_penalty = 0.0,
      presence_penalty = 0.0,
      max_tokens = 150,
      model = 'gpt-3.5-turbo'
    } = parameters;

    const startTime = Date.now();

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      max_tokens
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      content: completion.choices[0].message.content,
      model,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      max_tokens,
      usage: {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      },
      response_time: responseTime,
      provider: 'openai'
    };
  }

  async generateGoogleAIResponse(prompt, parameters = {}) {
    const {
      temperature = 0.7,
      top_p = 1.0,
      max_tokens = 150,
      model = 'gemini-2.5-pro-free' // Default to Gemini 2.5 Pro Free tier model
    } = parameters;

    const startTime = Date.now();

    // Ensure we have the correct model path format for Google AI Studio
    let actualModel = model;
    
    // Handle different model naming conventions for Google AI Studio free tier
    if (model === 'gemini-2.5-pro-free') {
      // Try different possible endpoints for Gemini 2.5 Pro Free
      actualModel = 'gemini-2.5-pro-free';
    } else if (!model.startsWith('models/') && !model.includes('gemini-2.0') && !model.includes('gemini-1.5')) {
      actualModel = `models/${model}`;
    }

    console.log(`🤖 Using Google AI model: ${actualModel}`);

    const geminiModel = this.googleAI.getGenerativeModel({ model: actualModel });
    
    const generationConfig = {
      temperature,
      topP: top_p,
      maxOutputTokens: max_tokens,
    };

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Google AI doesn't provide exact token usage, so we estimate
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      model: actualModel,
      temperature,
      top_p,
      frequency_penalty: 0, // Google AI doesn't have frequency_penalty
      presence_penalty: 0, // Google AI doesn't have presence_penalty
      max_tokens,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      response_time: responseTime,
      provider: 'google'
    };
  }

  async generateMockResponse(prompt, parameters = {}) {
    const {
      temperature = 0.7,
      top_p = 1.0,
      frequency_penalty = 0.0,
      presence_penalty = 0.0,
      max_tokens = 150,
      model = this.provider === 'google' ? 'gemini-pro' : 'gpt-3.5-turbo'
    } = parameters;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate mock responses that vary based on parameters
    const responses = this.getMockResponses(prompt, temperature, frequency_penalty, presence_penalty);
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate token usage
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(selectedResponse.length / 4);
    
    return {
      content: selectedResponse,
      model,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      max_tokens,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      response_time: 500 + Math.random() * 1000,
      provider: `${this.provider}-mock`
    };
  }

  getMockResponses(prompt, temperature, frequency_penalty = 0, presence_penalty = 0) {
    const basePromptLower = prompt.toLowerCase();
    
    // Different response styles based on temperature
    const lowTempResponses = [
      "This is a detailed and structured response to your query. The approach should be systematic and methodical, focusing on accuracy and completeness.",
      "Based on the information provided, I can offer a comprehensive analysis. The key factors to consider are methodological rigor and systematic evaluation.",
      "A thorough examination of this topic reveals several important considerations that should be addressed systematically and with careful attention to detail."
    ];
    
    const mediumTempResponses = [
      "There are several interesting approaches to consider here. Each has its own merits and can be adapted based on specific requirements and contextual factors.",
      "This is a fascinating question that opens up multiple avenues for exploration. The optimal solution likely involves balancing various competing priorities.",
      "I think there are creative ways to approach this challenge. The key is finding the right balance between innovation and practical implementation."
    ];
    
    const highTempResponses = [
      "Wow, this sparks so many creative possibilities! I'm thinking we could explore unconventional approaches that might yield surprising results.",
      "This reminds me of a fascinating concept I encountered recently. What if we completely reimagined the traditional approach and tried something totally different?",
      "You know what's interesting? This connects to so many different domains. I wonder if we could apply insights from completely unrelated fields to solve this creatively."
    ];
    
    // Select response set based on temperature
    if (temperature <= 0.3) {
      return lowTempResponses;
    } else if (temperature <= 0.7) {
      return mediumTempResponses;
    } else {
      return highTempResponses;
    }
  }

  async generateMultipleResponses(prompt, parameterCombinations) {
    const results = [];
    
    for (const params of parameterCombinations) {
      try {
        const response = await this.generateResponse(prompt, params);
        results.push({
          ...response,
          success: true,
          error: null
        });
      } catch (error) {
        console.error(`Error generating response for parameters ${JSON.stringify(params)}:`, error);
        results.push({
          content: null,
          success: false,
          error: error.message,
          temperature: params.temperature,
          top_p: params.top_p,
          provider: this.provider
        });
      }
    }
    
    return results;
  }

  isUsingMockMode() {
    return this.isMockMode;
  }

  getCurrentProvider() {
    return this.provider;
  }

  // Get service status (for compatibility with server.js)
  getStatus() {
    return {
      initialized: !this.isMockMode,
      mock_mode: this.isMockMode,
      provider: this.provider,
      ready: true
    };
  }

  // Test connection to the current LLM provider
  async testConnection() {
    if (this.isMockMode) {
      return { success: true, mock: true, message: `Mock mode active for ${this.provider}`, provider: this.provider };
    }

    try {
      if (this.provider === 'openai') {
        return await this.testOpenAIConnection();
      } else if (this.provider === 'google') {
        return await this.testGoogleAIConnection();
      }
    } catch (error) {
      return {
        success: false,
        mock: false,
        message: error.message,
        provider: this.provider
      };
    }
  }

  async testOpenAIConnection() {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5
    });

    return {
      success: true,
      mock: false,
      message: 'OpenAI API connection successful',
      model: response.model,
      provider: 'openai'
    };
  }

  async testGoogleAIConnection() {
    const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Test connection');
    const response = await result.response;

    return {
      success: true,
      mock: false,
      message: 'Google AI Studio connection successful',
      model: 'gemini-pro',
      provider: 'google'
    };
  }

  // Switch provider dynamically (useful for testing)
  async switchProvider(newProvider) {
    if (newProvider !== 'openai' && newProvider !== 'google') {
      throw new Error(`Unsupported provider: ${newProvider}`);
    }

    this.provider = newProvider;
    this.isMockMode = false;
    this.init();
    
    return {
      success: true,
      message: `Switched to ${newProvider} provider`,
      provider: this.provider,
      mockMode: this.isMockMode
    };
  }
}

module.exports = new LLMService();
