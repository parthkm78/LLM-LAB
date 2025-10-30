// Mock response generator for testing without backend
export const generateMockResponse = (prompt, parameters = {}) => {
  // Sample response templates based on different types of prompts
  const responseTemplates = {
    explanation: [
      "This is a detailed explanation addressing your question about {topic}. The concept involves several key components that work together to create a comprehensive understanding. First, we need to consider the fundamental principles that govern this area. These principles form the foundation upon which more complex ideas are built.",
      "To understand {topic}, it's helpful to break it down into its core elements. Each element plays a crucial role in the overall system, and their interactions create the behavior we observe. The process typically follows a specific sequence of steps that ensure optimal outcomes.",
      "The topic of {topic} encompasses several important aspects that are worth exploring in detail. From a theoretical perspective, this involves understanding the underlying mechanisms and principles. From a practical standpoint, it's about applying these concepts to real-world scenarios."
    ],
    creative: [
      "Once upon a time, in a world where {topic} was just beginning to emerge, there lived a curious individual who dared to explore the unknown. Their journey would lead them through challenges and discoveries that would forever change their understanding of the world.",
      "Imagine a scenario where {topic} becomes the central theme of an incredible adventure. The story unfolds as our protagonist navigates through complex situations, learning valuable lessons along the way. Each chapter reveals new insights and perspectives.",
      "In the realm of imagination, {topic} takes on new dimensions and possibilities. Here, conventional rules bend to accommodate creative expression, allowing for unique interpretations and innovative approaches to traditional concepts."
    ],
    technical: [
      "From a technical perspective, {topic} involves several sophisticated mechanisms and processes. The implementation requires careful consideration of various parameters including performance optimization, scalability factors, and system integration requirements.",
      "The technical architecture of {topic} consists of multiple interconnected components that work in harmony to achieve the desired functionality. Each component has specific responsibilities and interfaces that enable seamless communication and data flow.",
      "Technical analysis of {topic} reveals complex algorithms and data structures that optimize performance and ensure reliability. The system design incorporates best practices from software engineering and computer science principles."
    ],
    analysis: [
      "Analysis of {topic} reveals several interesting patterns and trends that provide valuable insights. The data suggests multiple factors contribute to the observed phenomena, with each factor having varying degrees of influence on the overall outcome.",
      "A comprehensive analysis of {topic} involves examining both quantitative and qualitative aspects. Statistical analysis shows correlations between different variables, while qualitative assessment provides context and deeper understanding.",
      "The analytical framework for {topic} encompasses multiple methodologies and approaches. By combining different analytical techniques, we can develop a more complete picture of the underlying dynamics and relationships."
    ]
  };

  // Determine response type based on prompt content
  const getResponseType = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('how does')) {
      return 'explanation';
    } else if (lowerPrompt.includes('create') || lowerPrompt.includes('write') || lowerPrompt.includes('story')) {
      return 'creative';
    } else if (lowerPrompt.includes('technical') || lowerPrompt.includes('implement') || lowerPrompt.includes('code')) {
      return 'technical';
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('compare') || lowerPrompt.includes('evaluate')) {
      return 'analysis';
    } else {
      return 'explanation'; // default
    }
  };

  const responseType = getResponseType(prompt);
  const templates = responseTemplates[responseType];
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Extract topic from prompt
  const topic = prompt.split(' ').slice(0, 3).join(' ') || 'the subject matter';
  
  // Generate response content
  let content = selectedTemplate.replace(/{topic}/g, topic);
  
  // Add parameter-influenced variations
  const temperature = parameters.temperature || 0.7;
  const maxTokens = parameters.max_tokens || 150;
  
  // Adjust response based on temperature
  if (temperature > 0.8) {
    content += " This response explores more creative and diverse perspectives, offering unique insights and unconventional approaches to the topic.";
  } else if (temperature < 0.3) {
    content += " This response maintains a focused and precise approach, adhering closely to established facts and conventional understanding.";
  }
  
  // Truncate based on max_tokens (approximate)
  const words = content.split(' ');
  if (words.length > maxTokens / 1.3) { // rough token to word ratio
    content = words.slice(0, Math.floor(maxTokens / 1.3)).join(' ') + '...';
  }

  // Generate realistic metrics
  const baseQuality = 75 + Math.random() * 20; // 75-95 range
  const variation = (Math.random() - 0.5) * 10; // ±5 points variation
  
  const mockResponse = {
    id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: content,
    model: parameters.model || 'gpt-3.5-turbo',
    responseTime: 1.2 + Math.random() * 2.8, // 1.2-4.0 seconds
    cost: 0.001 + Math.random() * 0.008, // $0.001-$0.009
    timestamp: new Date().toISOString(),
    tokenCount: Math.floor(content.split(' ').length * 1.3), // approximate tokens
    parameters: parameters,
    metrics: {
      overall_quality: Math.round(baseQuality),
      accuracy_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation))),
      relevance_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation * 0.8))),
      coherence_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation * 0.6))),
      completeness_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation * 0.4))),
      readability_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation * 0.9))),
      creativity_score: Math.round(Math.max(60, Math.min(100, baseQuality + (temperature - 0.5) * 30))),
      engagement_score: Math.round(Math.max(70, Math.min(100, baseQuality + variation * 0.7))),
      technical_depth: responseType === 'technical' ? Math.round(Math.max(80, Math.min(100, baseQuality + 10))) : Math.round(Math.max(60, Math.min(90, baseQuality - 5)))
    },
    confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100, // 0.85-0.99
    mock_mode: true
  };

  return mockResponse;
};

// Generate mock experiment
export const generateMockExperiment = (config) => {
  const experiment = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name || `Mock Experiment - ${new Date().toLocaleTimeString()}`,
    prompt: config.prompt,
    parameters: config.parameters || {},
    type: config.type || 'single',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    mock_mode: true
  };

  return experiment;
};

// Simulate API delay
export const simulateApiDelay = (minMs = 800, maxMs = 2000) => {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise(resolve => setTimeout(resolve, delay));
};
