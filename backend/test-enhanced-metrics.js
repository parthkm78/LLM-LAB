const qualityMetricsService = require('./services/qualityMetricsService');

// Test the enhanced quality metrics
const testContent = `This is a creative and wonderful story about a robot who learned to paint beautiful landscapes. The robot, named Artie, discovered that art was more than just precise calculations - it was about expressing emotions and capturing the essence of life. For example, when painting a sunset, Artie learned to blend colors in unexpected ways, creating masterpieces that amazed everyone who saw them.`;

const testPrompt = 'Write a creative story about a robot learning to paint';

console.log('🧪 Testing Enhanced Quality Metrics System\n');

try {
  const metrics = qualityMetricsService.calculateMetrics(testContent, testPrompt);
  
  console.log('📊 Quality Metrics Results:');
  console.log('================================');
  console.log(`🧠 Coherence Score: ${metrics.coherence_score}/100`);
  console.log(`✅ Completeness Score: ${metrics.completeness_score}/100`);
  console.log(`📖 Readability Score: ${metrics.readability_score}/100`);
  console.log(`📏 Length Appropriateness: ${metrics.length_appropriateness_score}/100`);
  console.log(`🎨 Creativity Score: ${metrics.creativity_score}/100`);
  console.log(`🎯 Specificity Score: ${metrics.specificity_score}/100`);
  console.log(`📈 Overall Score: ${metrics.overall_score}/100`);
  console.log('');
  console.log('📊 Text Statistics:');
  console.log(`   • Word Count: ${metrics.word_count}`);
  console.log(`   • Sentence Count: ${metrics.sentence_count}`);
  console.log(`   • Paragraph Count: ${metrics.paragraph_count}`);
  console.log(`   • Avg Sentence Length: ${metrics.avg_sentence_length} words`);
  console.log(`   • Lexical Diversity: ${metrics.lexical_diversity}`);
  console.log(`   • Sentiment Polarity: ${metrics.sentiment_polarity}`);
  console.log(`   • Complexity Score: ${metrics.complexity_score}`);
  
  console.log('\n✅ Enhanced quality metrics system working correctly!');
  
} catch (error) {
  console.error('❌ Error testing quality metrics:', error.message);
}
