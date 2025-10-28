const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing LLM Response Quality Analyzer API\n');

  try {
    // 1. Test Health Check
    console.log('1. Testing Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data);
    console.log('');

    // 2. Test Create Experiment
    console.log('2. Testing Create Experiment...');
    const experimentData = {
      name: "Test Temperature Experiment",
      description: "Testing different temperature values",
      prompt: "Write a short creative story about a robot learning to paint.",
      parameters: {
        temperature_min: 0.3,
        temperature_max: 0.9,
        temperature_step: 0.3,
        top_p_min: 0.8,
        top_p_max: 1.0,
        top_p_step: 0.1,
        max_tokens: 150,
        response_count: 2
      }
    };

    const experiment = await axios.post(`${API_BASE}/experiments`, experimentData);
    console.log('✅ Experiment created:', experiment.data);
    const experimentId = experiment.data.id;
    console.log('');

    // 3. Test Get Experiment
    console.log('3. Testing Get Experiment...');
    const getExperiment = await axios.get(`${API_BASE}/experiments/${experimentId}`);
    console.log('✅ Retrieved experiment:', getExperiment.data);
    console.log('');

    // 4. Test Response Generation
    console.log('4. Testing Response Generation...');
    const generateData = {
      experiment_id: experimentId,
      prompt: experimentData.prompt,
      parameters: experimentData.parameters
    };

    const responses = await axios.post(`${API_BASE}/responses/generate`, generateData);
    console.log('✅ Generated responses:', responses.data);
    console.log(`   Generated ${responses.data.responses?.length || 0} responses`);
    
    if (responses.data.responses && responses.data.responses.length > 0) {
      const firstResponse = responses.data.responses[0];
      console.log(`   Sample response: "${firstResponse.text?.substring(0, 100)}..."`);
      console.log(`   Parameters: temp=${firstResponse.temperature}, top_p=${firstResponse.top_p}`);
    }
    console.log('');

    // 5. Test Metrics Calculation
    if (responses.data.responses && responses.data.responses.length > 0) {
      console.log('5. Testing Metrics Calculation...');
      const responseId = responses.data.responses[0].id;
      const metrics = await axios.get(`${API_BASE}/metrics/${responseId}`);
      console.log('✅ Calculated metrics:', metrics.data);
      console.log('');
    }

    // 6. Test Export
    console.log('6. Testing Export...');
    const exportData = await axios.get(`${API_BASE}/export/${experimentId}`);
    console.log('✅ Export data retrieved');
    console.log(`   Experiment: ${exportData.data.experiment?.name}`);
    console.log(`   Responses: ${exportData.data.responses?.length || 0}`);
    console.log('');

    console.log('🎉 All tests passed! LLM integration is working.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.details) {
      console.error('   Details:', error.response.data.details);
    }
  }
}

// Run the test
testAPI();
