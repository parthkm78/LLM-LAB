const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

// Get current LLM provider information
router.get('/provider', async (req, res) => {
  try {
    const providerInfo = {
      currentProvider: llmService.getCurrentProvider(),
      mockMode: llmService.isUsingMockMode(),
      supportedProviders: ['openai', 'google']
    };

    res.json({
      success: true,
      data: providerInfo
    });
  } catch (error) {
    console.error('Error getting provider info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Switch LLM provider
router.post('/provider/switch', async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider is required'
      });
    }

    const result = await llmService.switchProvider(provider);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error switching provider:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Test connection to current provider
router.get('/test-connection', async (req, res) => {
  try {
    const connectionResult = await llmService.testConnection();
    
    res.json({
      success: true,
      data: connectionResult
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available models for current provider
router.get('/models', async (req, res) => {
  try {
    const provider = llmService.getCurrentProvider();
    let models = [];

    if (provider === 'openai') {
      models = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model, slower but higher quality' },
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with latest knowledge' }
      ];
    } else if (provider === 'google') {
      models = [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient model - Free tier' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable model - Limited free usage' },
        { id: 'gemini-pro', name: 'Gemini Pro (Legacy)', description: 'Legacy model - may not be available' },
        { id: 'text-bison-001', name: 'Text Bison', description: 'Legacy text generation model' }
      ];
    }

    res.json({
      success: true,
      data: {
        provider,
        models
      }
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate response using current LLM provider
router.post('/generate', async (req, res) => {
  try {
    const { prompt, parameters } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Default parameters if not provided
    const defaultParams = {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 500,
      model: llmService.getCurrentProvider() === 'google' ? 'gemini-pro' : 'gpt-3.5-turbo',
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };

    const finalParams = { ...defaultParams, ...parameters };

    const startTime = Date.now();
    const result = await llmService.generateResponse(prompt, finalParams);
    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        response: result.text || result.content || result,
        provider: llmService.getCurrentProvider(),
        model: finalParams.model,
        executionTime: `${executionTime}ms`,
        parameters: finalParams,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0
      }
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate response'
    });
  }
});

module.exports = router;
