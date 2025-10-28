class QualityMetricsService {
  
  /**
   * Calculate all quality metrics for a given response
   * @param {string} content - The response content to analyze
   * @param {string} originalPrompt - The original prompt (optional, for completeness analysis)
   * @returns {Object} Object containing all calculated metrics
   */
  calculateMetrics(content, originalPrompt = '') {
    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    const textStats = this.getTextStatistics(content);
    
    const coherence = this.calculateCoherenceScore(content);
    const completeness = this.calculateCompletenessScore(content, originalPrompt);
    const readability = this.calculateReadabilityScore(content, textStats);
    const lengthApproppriateness = this.calculateLengthAppropriateness(content, originalPrompt);
    const creativity = this.calculateCreativityScore(content);
    const specificity = this.calculateSpecificityScore(content, originalPrompt);
    
    // Calculate overall score as weighted average
    const overall = this.calculateOverallScore({
      coherence,
      completeness,
      readability,
      lengthApproppriateness,
      creativity,
      specificity
    });

    return {
      coherence_score: Math.round(coherence * 100) / 100,
      completeness_score: Math.round(completeness * 100) / 100,
      readability_score: Math.round(readability * 100) / 100,
      length_appropriateness_score: Math.round(lengthApproppriateness * 100) / 100,
      creativity_score: Math.round(creativity * 100) / 100,
      specificity_score: Math.round(specificity * 100) / 100,
      overall_score: Math.round(overall * 100) / 100,
      word_count: textStats.wordCount,
      sentence_count: textStats.sentenceCount,
      paragraph_count: textStats.paragraphCount,
      avg_sentence_length: Math.round(textStats.avgSentenceLength * 100) / 100,
      lexical_diversity: Math.round(textStats.lexicalDiversity * 100) / 100,
      sentiment_polarity: Math.round(textStats.sentimentPolarity * 100) / 100,
      complexity_score: Math.round(textStats.complexityScore * 100) / 100
    };
  }

  /**
   * Get basic text statistics
   */
  getTextStatistics(content) {
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgSentenceLength: sentences.length > 0 ? words.length / sentences.length : 0,
      lexicalDiversity: words.length > 0 ? uniqueWords.size / words.length : 0,
      sentimentPolarity: this.calculateSentimentPolarity(content),
      complexityScore: this.calculateComplexityScore(words, sentences)
    };
  }

  /**
   * Calculate coherence score (0-1)
   * Measures logical flow and consistency
   */
  calculateCoherenceScore(content) {
    const sentences = this.splitIntoSentences(content);
    if (sentences.length < 2) return 0.5; // Neutral score for very short responses

    let coherenceScore = 0;
    let factors = 0;

    // Factor 1: Transition words and phrases
    const transitionScore = this.analyzeTransitions(sentences);
    coherenceScore += transitionScore * 0.3;
    factors += 0.3;

    // Factor 2: Pronoun consistency
    const pronounScore = this.analyzePronounConsistency(sentences);
    coherenceScore += pronounScore * 0.2;
    factors += 0.2;

    // Factor 3: Topic consistency (word overlap between sentences)
    const topicScore = this.analyzeTopicConsistency(sentences);
    coherenceScore += topicScore * 0.3;
    factors += 0.3;

    // Factor 4: Sentence structure variety
    const structureScore = this.analyzeSentenceStructure(sentences);
    coherenceScore += structureScore * 0.2;
    factors += 0.2;

    return coherenceScore / factors;
  }

  /**
   * Calculate completeness score (0-1)
   * Measures how thoroughly the response addresses the prompt
   */
  calculateCompletenessScore(content, originalPrompt = '') {
    if (!originalPrompt) {
      // If no prompt provided, use content length and structure as proxy
      return this.estimateCompletenessFromContent(content);
    }

    const promptWords = originalPrompt.toLowerCase().match(/\b\w+\b/g) || [];
    const responseWords = content.toLowerCase().match(/\b\w+\b/g) || [];
    
    let completenessScore = 0;
    let factors = 0;

    // Factor 1: Key term coverage
    const keyTermScore = this.analyzeKeyTermCoverage(promptWords, responseWords);
    completenessScore += keyTermScore * 0.4;
    factors += 0.4;

    // Factor 2: Response depth (length relative to prompt complexity)
    const depthScore = this.analyzeResponseDepth(content, originalPrompt);
    completenessScore += depthScore * 0.3;
    factors += 0.3;

    // Factor 3: Structural completeness (introduction, body, conclusion)
    const structureScore = this.analyzeStructuralCompleteness(content);
    completenessScore += structureScore * 0.3;
    factors += 0.3;

    return completenessScore / factors;
  }

  /**
   * Calculate readability score (0-1)
   * Measures clarity and ease of understanding
   */
  calculateReadabilityScore(content, textStats) {
    let readabilityScore = 0;
    let factors = 0;

    // Factor 1: Average sentence length (optimal range: 15-20 words)
    const sentenceLengthScore = this.scoreSentenceLength(textStats.avgSentenceLength);
    readabilityScore += sentenceLengthScore * 0.3;
    factors += 0.3;

    // Factor 2: Lexical diversity (vocabulary richness)
    const diversityScore = Math.min(textStats.lexicalDiversity * 2, 1); // Scale to 0-1
    readabilityScore += diversityScore * 0.2;
    factors += 0.2;

    // Factor 3: Paragraph structure
    const paragraphScore = this.scoreParagraphStructure(textStats);
    readabilityScore += paragraphScore * 0.2;
    factors += 0.2;

    // Factor 4: Word complexity (simpler words = higher readability)
    const complexityScore = this.analyzeWordComplexity(content);
    readabilityScore += complexityScore * 0.3;
    factors += 0.3;

    return readabilityScore / factors;
  }

  /**
   * Calculate length appropriateness score (0-1)
   * Measures if response length matches prompt complexity
   */
  calculateLengthAppropriateness(content, originalPrompt = '') {
    const responseLength = content.split(/\s+/).length;
    
    if (!originalPrompt) {
      // Use general guidelines: 50-300 words is typically appropriate
      if (responseLength < 20) return 0.3; // Too short
      if (responseLength > 500) return 0.6; // Potentially too long
      return 0.8; // Reasonable length
    }

    const promptComplexity = this.assessPromptComplexity(originalPrompt);
    const expectedLength = this.getExpectedLength(promptComplexity);
    
    const lengthRatio = responseLength / expectedLength;
    
    // Optimal range is 0.7 to 1.3 times expected length
    if (lengthRatio >= 0.7 && lengthRatio <= 1.3) {
      return 1.0;
    } else if (lengthRatio >= 0.5 && lengthRatio <= 1.8) {
      return 0.7;
    } else {
      return 0.4;
    }
  }

  // Helper methods

  splitIntoSentences(content) {
    return content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  analyzeTransitions(sentences) {
    const transitionWords = [
      'however', 'therefore', 'furthermore', 'moreover', 'additionally', 
      'consequently', 'nevertheless', 'meanwhile', 'similarly', 'conversely',
      'first', 'second', 'finally', 'in conclusion', 'for example', 'such as'
    ];
    
    let transitionCount = 0;
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      transitionWords.forEach(word => {
        if (lowerSentence.includes(word)) {
          transitionCount++;
        }
      });
    });
    
    return Math.min(transitionCount / sentences.length, 1);
  }

  analyzePronounConsistency(sentences) {
    // Simple heuristic: look for consistent use of pronouns
    const pronounPattern = /\b(I|we|you|they|it|he|she)\b/gi;
    let consistencyScore = 0.5; // Start with neutral
    
    // This is a simplified implementation
    // In a more sophisticated version, we'd track pronoun references
    
    return consistencyScore;
  }

  analyzeTopicConsistency(sentences) {
    if (sentences.length < 2) return 0.5;
    
    let totalOverlap = 0;
    let comparisons = 0;
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const words1 = new Set(sentences[i].toLowerCase().match(/\b\w+\b/g) || []);
      const words2 = new Set(sentences[i + 1].toLowerCase().match(/\b\w+\b/g) || []);
      
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      
      if (union.size > 0) {
        totalOverlap += intersection.size / union.size;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalOverlap / comparisons : 0.5;
  }

  analyzeSentenceStructure(sentences) {
    // Analyze variety in sentence lengths
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    // Higher variance = better structure variety (up to a point)
    return Math.min(Math.sqrt(variance) / 10, 1);
  }

  estimateCompletenessFromContent(content) {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = this.splitIntoSentences(content).length;
    
    // Heuristic based on content structure
    if (wordCount < 20) return 0.3;
    if (wordCount > 100 && sentenceCount > 5) return 0.8;
    return 0.6;
  }

  analyzeKeyTermCoverage(promptWords, responseWords) {
    if (promptWords.length === 0) return 0.5;
    
    const promptSet = new Set(promptWords);
    const responseSet = new Set(responseWords);
    const intersection = new Set([...promptSet].filter(x => responseSet.has(x)));
    
    return intersection.size / promptSet.size;
  }

  analyzeResponseDepth(content, prompt) {
    const responseWords = content.split(/\s+/).length;
    const promptWords = prompt.split(/\s+/).length;
    
    const ratio = responseWords / Math.max(promptWords, 1);
    
    // Expect response to be 2-10 times longer than prompt
    if (ratio >= 2 && ratio <= 10) return 1.0;
    if (ratio >= 1 && ratio <= 15) return 0.7;
    return 0.4;
  }

  analyzeStructuralCompleteness(content) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Multi-paragraph responses typically more complete
    if (paragraphs.length >= 3) return 0.9;
    if (paragraphs.length === 2) return 0.7;
    return 0.5;
  }

  scoreSentenceLength(avgLength) {
    // Optimal sentence length is around 15-20 words
    if (avgLength >= 15 && avgLength <= 20) return 1.0;
    if (avgLength >= 10 && avgLength <= 25) return 0.8;
    if (avgLength >= 5 && avgLength <= 30) return 0.6;
    return 0.4;
  }

  scoreParagraphStructure(textStats) {
    const { wordCount, paragraphCount } = textStats;
    
    if (paragraphCount === 0) return 0.1;
    
    const avgWordsPerParagraph = wordCount / paragraphCount;
    
    // Optimal paragraph length: 50-150 words
    if (avgWordsPerParagraph >= 50 && avgWordsPerParagraph <= 150) return 1.0;
    if (avgWordsPerParagraph >= 30 && avgWordsPerParagraph <= 200) return 0.8;
    return 0.6;
  }

  analyzeWordComplexity(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    let complexWords = 0;
    
    words.forEach(word => {
      // Words longer than 6 characters or containing complex patterns
      if (word.length > 6 || /tion|sion|ment|ness|able|ible/.test(word)) {
        complexWords++;
      }
    });
    
    const complexityRatio = complexWords / words.length;
    
    // Moderate complexity is ideal (10-30%)
    if (complexityRatio >= 0.1 && complexityRatio <= 0.3) return 1.0;
    if (complexityRatio >= 0.05 && complexityRatio <= 0.4) return 0.8;
    return 0.6;
  }

  assessPromptComplexity(prompt) {
    const words = prompt.split(/\s+/).length;
    const questions = (prompt.match(/\?/g) || []).length;
    const complexWords = (prompt.match(/\b\w{8,}\b/g) || []).length;
    
    let complexity = 0;
    
    if (words > 20) complexity += 0.3;
    if (questions > 1) complexity += 0.3;
    if (complexWords > 3) complexity += 0.4;
    
    return Math.max(0.3, Math.min(1.0, complexity));
  }

  /**
   * Calculate creativity score based on unique expressions and language patterns
   */
  calculateCreativityScore(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = this.splitIntoSentences(content);
    
    let creativityScore = 0;
    let factors = 0;

    // Factor 1: Metaphors and figurative language
    const metaphorScore = this.detectMetaphors(content);
    creativityScore += metaphorScore * 0.3;
    factors += 0.3;

    // Factor 2: Varied sentence structures
    const varietyScore = this.analyzeSentenceVariety(sentences);
    creativityScore += varietyScore * 0.25;
    factors += 0.25;

    // Factor 3: Uncommon word usage
    const uncommonWordsScore = this.analyzeUncommonWords(words);
    creativityScore += uncommonWordsScore * 0.25;
    factors += 0.25;

    // Factor 4: Narrative elements (if applicable)
    const narrativeScore = this.detectNarrativeElements(content);
    creativityScore += narrativeScore * 0.2;
    factors += 0.2;

    return creativityScore / factors;
  }

  /**
   * Calculate specificity score based on concrete details and precision
   */
  calculateSpecificityScore(content, originalPrompt = '') {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    
    let specificityScore = 0;
    let factors = 0;

    // Factor 1: Numbers and quantities
    const numberScore = this.analyzeNumericalSpecificity(content);
    specificityScore += numberScore * 0.3;
    factors += 0.3;

    // Factor 2: Specific terms vs. vague terms
    const termSpecificityScore = this.analyzeTermSpecificity(words);
    specificityScore += termSpecificityScore * 0.4;
    factors += 0.4;

    // Factor 3: Examples and concrete details
    const exampleScore = this.detectExamples(content);
    specificityScore += exampleScore * 0.3;
    factors += 0.3;

    return specificityScore / factors;
  }

  /**
   * Calculate sentiment polarity (-1 to 1, negative to positive)
   */
  calculateSentimentPolarity(content) {
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'like', 'enjoy', 'happy', 'pleased', 'beautiful', 'perfect', 'brilliant', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'upset', 'disappointed', 'wrong', 'failed', 'broken', 'difficult', 'problem'];
    
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;
    
    return (positiveCount - negativeCount) / totalSentimentWords;
  }

  /**
   * Calculate complexity score based on word and sentence patterns
   */
  calculateComplexityScore(words, sentences) {
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0) / sentences.length;
    
    // Normalize to 0-1 scale
    const wordComplexity = Math.min(avgWordLength / 8, 1);
    const sentenceComplexity = Math.min(avgSentenceLength / 25, 1);
    
    return (wordComplexity + sentenceComplexity) / 2;
  }

  /**
   * Helper methods for creativity analysis
   */
  detectMetaphors(content) {
    const metaphorPatterns = [
      /\bis like\b/gi,
      /\bas\s+\w+\s+as\b/gi,
      /\bmetaphor/gi,
      /\bsimilar to\b/gi
    ];
    
    let metaphorCount = 0;
    metaphorPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      metaphorCount += matches.length;
    });
    
    const sentences = this.splitIntoSentences(content);
    return Math.min(metaphorCount / sentences.length, 1);
  }

  analyzeSentenceVariety(sentences) {
    if (sentences.length < 2) return 0.5;
    
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const structures = sentences.map(s => this.analyzeSentenceStructureType(s));
    
    const lengthVariance = this.calculateVariance(lengths);
    const structureVariety = new Set(structures).size / structures.length;
    
    return (Math.min(lengthVariance / 25, 1) + structureVariety) / 2;
  }

  analyzeUncommonWords(words) {
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their']);
    
    const uncommonWords = words.filter(word => !commonWords.has(word) && word.length > 5);
    return Math.min(uncommonWords.length / words.length * 2, 1);
  }

  detectNarrativeElements(content) {
    const narrativeMarkers = [
      /\bonce upon a time\b/gi,
      /\bfirst\b.*\bthen\b.*\bfinally\b/gi,
      /\bsuddenly\b/gi,
      /\bmeanwhile\b/gi,
      /\bin the end\b/gi
    ];
    
    let narrativeCount = 0;
    narrativeMarkers.forEach(pattern => {
      if (pattern.test(content)) narrativeCount++;
    });
    
    return Math.min(narrativeCount / 3, 1);
  }

  /**
   * Helper methods for specificity analysis
   */
  analyzeNumericalSpecificity(content) {
    const numbers = content.match(/\b\d+(?:\.\d+)?\b/g) || [];
    const dates = content.match(/\b(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g) || [];
    const percentages = content.match(/\b\d+(?:\.\d+)?%\b/g) || [];
    
    const totalNumerical = numbers.length + dates.length + percentages.length;
    const sentences = this.splitIntoSentences(content);
    
    return Math.min(totalNumerical / sentences.length, 1);
  }

  analyzeTermSpecificity(words) {
    const vague = ['thing', 'stuff', 'something', 'anything', 'everything', 'some', 'many', 'few', 'several', 'various'];
    const specific = words.filter(word => word.length > 6 && !vague.includes(word));
    
    return Math.min(specific.length / words.length * 2, 1);
  }

  detectExamples(content) {
    const examplePatterns = [
      /\bfor example\b/gi,
      /\bsuch as\b/gi,
      /\bincluding\b/gi,
      /\bnamely\b/gi,
      /\be\.g\.\b/gi
    ];
    
    let exampleCount = 0;
    examplePatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      exampleCount += matches.length;
    });
    
    const sentences = this.splitIntoSentences(content);
    return Math.min(exampleCount / sentences.length, 1);
  }

  /**
   * Updated overall score calculation with new metrics
   */
  calculateOverallScore(scores) {
    const weights = {
      coherence: 0.25,
      completeness: 0.25,
      readability: 0.2,
      lengthApproppriateness: 0.1,
      creativity: 0.1,
      specificity: 0.1
    };

    return (
      scores.coherence * weights.coherence +
      scores.completeness * weights.completeness +
      scores.readability * weights.readability +
      scores.lengthApproppriateness * weights.lengthApproppriateness +
      scores.creativity * weights.creativity +
      scores.specificity * weights.specificity
    );
  }

  /**
   * Helper methods
   */
  analyzeSentenceStructureType(sentence) {
    if (sentence.includes('?')) return 'question';
    if (sentence.includes('!')) return 'exclamation';
    if (sentence.includes(',') && sentence.includes('and')) return 'compound';
    if (sentence.split(/\s+/).length > 15) return 'complex';
    return 'simple';
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
  }

  getExpectedLength(complexity) {
    // Base length of 100 words, adjusted by complexity
    return Math.floor(100 + (complexity * 150));
  }
}

module.exports = new QualityMetricsService();
