require('dotenv').config();
const OpenAI = require('openai');

async function testRealOpenAI() {
  console.log('🔑 API Key loaded:', !!process.env.OPENAI_API_KEY);
  console.log('🔑 API Key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('❌ No valid OpenAI API key found');
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('🤖 OpenAI client created, testing connection...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Write a very short creative story about a robot learning to paint.'
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 100
    });

    console.log('✅ OpenAI API connection successful!');
    console.log('📝 Response:', response.choices[0].message.content);
    console.log('🔢 Usage:', response.usage);
    console.log('🏷️  Model:', response.model);
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
  }
}

testRealOpenAI();
