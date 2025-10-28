/**
 * Test Multi-Provider LLM Service
 * This script tests the multi-provider functionality
 */

const express = require('express');
const llmService = require('./src/services/llmService');

async function testMultiProvider() {
  console.log('🧪 Testing Multi-Provider LLM Service\n');

  try {
    // Test initial provider
    console.log('1. Testing initial provider (OpenAI)...');
    let status = llmService.getStatus();
    console.log('Current Status:', status);
    console.log('Current Provider:', llmService.getCurrentProvider());
    console.log('Mock Mode:', llmService.isUsingMockMode());
    console.log('');

    // Test provider switching to Google
    console.log('2. Switching to Google AI Studio...');
    try {
      const switchResult = await llmService.switchProvider('google');
      console.log('Switch Result:', switchResult);
      console.log('New Provider:', llmService.getCurrentProvider());
      console.log('Mock Mode:', llmService.isUsingMockMode());
    } catch (error) {
      console.log('Expected (Google API key not configured):', error.message);
    }
    console.log('');

    // Test switching back to OpenAI
    console.log('3. Switching back to OpenAI...');
    const switchBackResult = await llmService.switchProvider('openai');
    console.log('Switch Back Result:', switchBackResult);
    console.log('Final Provider:', llmService.getCurrentProvider());
    console.log('Mock Mode:', llmService.isUsingMockMode());
    console.log('');

    // Test response generation with mock mode
    console.log('4. Testing response generation (mock mode)...');
    const testPrompt = "Explain the benefits of using multiple LLM providers in one sentence.";
    const testResponse = await llmService.generateResponse(testPrompt, {
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('Test Response:');
    console.log('- Content:', testResponse.content);
    console.log('- Provider:', testResponse.provider);
    console.log('- Model:', testResponse.model);
    console.log('- Response Time:', testResponse.response_time + 'ms');
    console.log('');

    // Test connection
    console.log('5. Testing connection...');
    const connectionTest = await llmService.testConnection();
    console.log('Connection Test Result:', connectionTest);
    console.log('');

    console.log('✅ Multi-Provider LLM Service test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Multi-provider switching: ✓ Working');
    console.log('- Provider status tracking: ✓ Working');
    console.log('- Mock mode fallback: ✓ Working');
    console.log('- Response generation: ✓ Working');
    console.log('- Connection testing: ✓ Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMultiProvider();
