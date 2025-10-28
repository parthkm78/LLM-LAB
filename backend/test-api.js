const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing LLM Response Quality Analyzer API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('   Services:', healthResponse.data.services);

    // Test 2: Create Experiment
    console.log('\n2. Creating test experiment...');
    const experimentData = {
      name: 'Test Temperature Experiment',
      description: 'Testing different temperature values for creative writing',
      prompt: 'Write a short story about a robot discovering emotions.',
      temperature_min: 0.3,
      temperature_max: 0.9,
      temperature_step: 0.3,
      top_p_min: 0.8,
      top_p_max: 1.0,
      top_p_step: 0.2,
      max_tokens: 100,
      response_count: 2
    };

    const createResponse = await axios.post(`${API_BASE}/experiments`, experimentData);
    const experiment = createResponse.data.experiment;
    console.log('✅ Experiment created:', experiment.id);
    console.log('   Parameter combinations:', createResponse.data.total_combinations);

    // Test 3: List Experiments
    console.log('\n3. Listing all experiments...');
    const listResponse = await axios.get(`${API_BASE}/experiments`);
    console.log('✅ Found experiments:', listResponse.data.total);

    // Test 4: Generate Responses
    console.log('\n4. Generating responses...');
    const generateResponse = await axios.post(`${API_BASE}/responses/generate`, {
      experiment_id: experiment.id,
      generate_all: true
    });
    console.log('✅ Response generation completed');
    console.log('   Generated:', generateResponse.data.summary.total_generated);
    console.log('   Errors:', generateResponse.data.summary.total_errors);
    console.log('   Mock mode:', generateResponse.data.mock_mode);

    // Test 5: Get Experiment with Responses
    console.log('\n5. Fetching experiment with responses...');
    const experimentDetails = await axios.get(`${API_BASE}/experiments/${experiment.id}`);
    console.log('✅ Experiment details retrieved');
    console.log('   Total responses:', experimentDetails.data.total_responses);

    // Test 6: Get Metrics
    console.log('\n6. Fetching quality metrics...');
    const metricsResponse = await axios.get(`${API_BASE}/metrics/experiment/${experiment.id}`);
    console.log('✅ Metrics retrieved');
    console.log('   Total metrics:', metricsResponse.data.total);
    
    if (metricsResponse.data.metrics.length > 0) {
      const sampleMetrics = metricsResponse.data.metrics[0];
      console.log('   Sample metrics:');
      console.log(`     Coherence: ${sampleMetrics.coherence_score}`);
      console.log(`     Completeness: ${sampleMetrics.completeness_score}`);
      console.log(`     Readability: ${sampleMetrics.readability_score}`);
      console.log(`     Overall: ${sampleMetrics.overall_score}`);
    }

    // Test 7: Export Data
    console.log('\n7. Testing export functionality...');
    const exportResponse = await axios.get(`${API_BASE}/export/${experiment.id}`);
    console.log('✅ Export successful');
    console.log('   Exported responses:', exportResponse.data.responses.length);

    console.log('\n🎉 All API tests passed! Backend is working correctly.\n');

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
    console.log('\nMake sure the backend server is running on port 5000');
  }
}

testAPI();
