const OpenAI = require('openai');

class LLMService {
  constructor() {
    // Initialize OpenAI client if API key is available, otherwise use mock mode
    this.openai = null;
    this.isMockMode = false;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('🤖 OpenAI API initialized');
    } else {
      this.isMockMode = true;
      console.log('🎭 Running in mock mode - no OpenAI API key provided');
    }
  }

  async generateResponse(prompt, parameters = {}) {
    const {
      temperature = 0.7,
      top_p = 1.0,
      frequency_penalty = 0.0,
      presence_penalty = 0.0,
      max_tokens = 150,
      model = 'gpt-3.5-turbo'
    } = parameters;

    const startTime = Date.now();

    try {
      if (this.isMockMode) {
        return await this.generateMockResponse(prompt, parameters);
      }

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
        response_time: responseTime
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // If OpenAI fails, fall back to mock mode for this request
      console.log('🎭 Falling back to mock mode due to API error');
      return await this.generateMockResponse(prompt, parameters);
    }
  }

  async generateMockResponse(prompt, parameters = {}) {
    const {
      temperature = 0.7,
      top_p = 1.0,
      frequency_penalty = 0.0,
      presence_penalty = 0.0,
      max_tokens = 150,
      model = 'gpt-3.5-turbo'
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
      response_time: 500 + Math.random() * 1000
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
          top_p: params.top_p
        });
      }
    }
    
    return results;
  }

  isUsingMockMode() {
    return this.isMockMode;
  }

  // Test connection to OpenAI API
  async testConnection() {
    if (this.isMockMode) {
      return { success: true, mock: true, message: 'Mock mode active' };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      });

      return {
        success: true,
        mock: false,
        message: 'OpenAI API connection successful',
        model: response.model
      };
    } catch (error) {
      return {
        success: false,
        mock: false,
        message: error.message
      };
    }
  }
}

module.exports = new LLMService();
