#!/usr/bin/env node

const llmService = require('./services/llmService');
const qualityMetricsService = require('./services/qualityMetricsService');

/**
 * Test script for OpenAI integration and quality metrics
 * This demonstrates the core functionality required for the GenAI Labs Challenge
 */

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI Integration and Quality Metrics\n');

  const testPrompt = "Write a short creative story about a robot learning to paint.";
  
  // Test different parameter combinations
  const parameterCombinations = [
    { temperature: 0.3, top_p: 0.8, max_tokens: 150 },
    { temperature: 0.7, top_p: 0.9, max_tokens: 150 },
    { temperature: 1.0, top_p: 1.0, max_tokens: 150 }
  ];

  console.log(`📝 Test Prompt: "${testPrompt}"\n`);
  console.log(`🎛️  Testing ${parameterCombinations.length} parameter combinations:\n`);

  const results = [];

  for (let i = 0; i < parameterCombinations.length; i++) {
    const params = parameterCombinations[i];
    console.log(`🔄 Generating response ${i + 1}/3 with parameters:`, params);
    
    try {
      // Generate response
      const startTime = Date.now();
      const response = await llmService.generateResponse(testPrompt, params);
      const endTime = Date.now();
      
      console.log(`✅ Response generated in ${endTime - startTime}ms`);
      console.log(`📊 Model: ${response.model}`);
      console.log(`🔢 Token usage: ${response.usage.total_tokens} total (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`);
      
      // Calculate quality metrics
      const metrics = qualityMetricsService.calculateMetrics(response.content, testPrompt);
      
      console.log(`📈 Quality Metrics:`);
      console.log(`   • Coherence: ${metrics.coherence_score}/100`);
      console.log(`   • Completeness: ${metrics.completeness_score}/100`);
      console.log(`   • Readability: ${metrics.readability_score}/100`);
      console.log(`   • Length Appropriateness: ${metrics.length_appropriateness_score}/100`);
      console.log(`   • Overall Score: ${metrics.overall_score}/100`);
      
      console.log(`📝 Response Preview: "${response.content.substring(0, 100)}..."`);
      console.log(`📊 Text Stats: ${metrics.word_count} words, ${metrics.sentence_count} sentences\n`);
      
      results.push({
        parameters: params,
        response: response.content,
        metrics,
        usage: response.usage,
        responseTime: response.response_time
      });
      
    } catch (error) {
      console.error(`❌ Error generating response:`, error.message);
      console.log('');
    }
    
    // Add delay between requests to respect rate limits
    if (i < parameterCombinations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Analysis summary
  console.log('📊 EXPERIMENT SUMMARY');
  console.log('=' .repeat(50));
  
  if (results.length > 0) {
    const bestResponse = results.reduce((best, current) => 
      current.metrics.overall_score > best.metrics.overall_score ? current : best
    );
    
    console.log(`🏆 Best Overall Response (Score: ${bestResponse.metrics.overall_score}):`);
    console.log(`   Temperature: ${bestResponse.parameters.temperature}`);
    console.log(`   Top-p: ${bestResponse.parameters.top_p}`);
    console.log(`   Response: "${bestResponse.response.substring(0, 150)}..."`);
    console.log('');
    
    // Average metrics
    const avgMetrics = {
      coherence: results.reduce((sum, r) => sum + r.metrics.coherence_score, 0) / results.length,
      completeness: results.reduce((sum, r) => sum + r.metrics.completeness_score, 0) / results.length,
      readability: results.reduce((sum, r) => sum + r.metrics.readability_score, 0) / results.length,
      overall: results.reduce((sum, r) => sum + r.metrics.overall_score, 0) / results.length
    };
    
    console.log(`📈 Average Quality Metrics Across All Responses:`);
    console.log(`   • Coherence: ${avgMetrics.coherence.toFixed(1)}`);
    console.log(`   • Completeness: ${avgMetrics.completeness.toFixed(1)}`);
    console.log(`   • Readability: ${avgMetrics.readability.toFixed(1)}`);
    console.log(`   • Overall: ${avgMetrics.overall.toFixed(1)}`);
    
  } else {
    console.log('❌ No successful responses generated');
  }

  console.log('\n🔧 Service Status:');
  console.log(`   Mock Mode: ${llmService.isUsingMockMode()}`);
  if (llmService.isUsingMockMode()) {
    console.log('   ⚠️  To test with real OpenAI API, add your API key to .env file');
  }

  console.log('\n✅ Test completed!');
}

// Test connection first
async function testConnection() {
  console.log('🔌 Testing LLM Service Connection...');
  
  try {
    const connectionResult = await llmService.testConnection();
    
    if (connectionResult.success) {
      if (connectionResult.mock) {
        console.log('✅ Connected in MOCK mode');
        console.log('⚠️  Add OPENAI_API_KEY to .env for real API testing\n');
      } else {
        console.log('✅ Connected to OpenAI API');
        console.log(`📡 Model: ${connectionResult.model}\n`);
      }
      
      // Proceed with integration test
      await testOpenAIIntegration();
      
    } else {
      console.error('❌ Connection failed:', connectionResult.message);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testConnection().catch(console.error);
}

module.exports = { testOpenAIIntegration, testConnection };
