// Simple test to verify LLM service is working
const llmService = require('./services/llmService');

async function testLLMService() {
  console.log('🧪 Testing LLM Service...\n');

  try {
    // Test connection
    console.log('1. Testing LLM connection...');
    const connectionTest = await llmService.testConnection();
    console.log('✅ Connection test:', connectionTest);
    console.log('');

    // Test single response generation
    console.log('2. Testing single response generation...');
    const prompt = "Write a short creative story about a robot learning to paint.";
    const response = await llmService.generateResponse(prompt, {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 150
    });
    
    console.log('✅ Response generated successfully:');
    console.log(`   Content: "${response.content?.substring(0, 100)}..."`);
    console.log(`   Temperature: ${response.temperature}`);
    console.log(`   Top-p: ${response.top_p}`);
    console.log(`   Tokens: ${response.usage?.total_tokens}`);
    console.log(`   Response time: ${response.response_time}ms`);
    console.log('');

    // Test multiple responses with different parameters
    console.log('3. Testing multiple parameter combinations...');
    const parameterCombinations = [
      { temperature: 0.3, top_p: 0.8, max_tokens: 100 },
      { temperature: 0.7, top_p: 0.9, max_tokens: 150 },
      { temperature: 1.0, top_p: 1.0, max_tokens: 200 }
    ];

    const multipleResponses = await llmService.generateMultipleResponses(prompt, parameterCombinations);
    console.log(`✅ Generated ${multipleResponses.length} responses with different parameters:`);
    
    multipleResponses.forEach((resp, index) => {
      if (resp.success) {
        console.log(`   Response ${index + 1}: temp=${resp.temperature}, length=${resp.content?.length} chars`);
        console.log(`     "${resp.content?.substring(0, 80)}..."`);
      } else {
        console.log(`   Response ${index + 1}: ❌ Failed - ${resp.error}`);
      }
    });
    console.log('');

    console.log('🎉 LLM Service test completed successfully!');
    console.log(`   Mode: ${llmService.isUsingMockMode() ? 'MOCK' : 'REAL OpenAI API'}`);

  } catch (error) {
    console.error('❌ LLM Service test failed:', error);
  }
}

// Run the test
testLLMService();
