/**
 * @fileoverview Enhanced Quality Metrics Service
 * @description Production-ready quality metrics calculation with comprehensive scoring algorithms
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const logger = require('../utils/logger');

/**
 * Enhanced Quality Metrics Service
 * Provides comprehensive quality assessment for LLM responses
 */
class QualityMetricsService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize the service
   */
  init() {
    logger.info('Quality Metrics Service initialized');
    this.initialized = true;
  }

  /**
   * Calculate all quality metrics for a response
   * @param {string} response - LLM response text
   * @param {string} prompt - Original prompt
   * @returns {Promise<Object>} Quality metrics scores
   */
  async calculateMetrics(response, prompt) {
    try {
      logger.debug('Calculating quality metrics', {
        responseLength: response.length,
        promptLength: prompt.length
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Response must be a non-empty string');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      const metrics = {
        coherence: await this.calculateCoherence(response),
        completeness: await this.calculateCompleteness(response, prompt),
        readability: await this.calculateReadability(response),
        creativity: await this.calculateCreativity(response),
        specificity: await this.calculateSpecificity(response),
        length_appropriateness: await this.calculateLengthAppropriateness(response, prompt)
      };

      logger.debug('Quality metrics calculated', { metrics });

      return metrics;
    } catch (error) {
      logger.error('Error calculating quality metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate coherence score (logical flow and consistency)
   * @param {string} response - Response text
   * @returns {Promise<number>} Coherence score (0-1)
   */
  async calculateCoherence(response) {
    try {
      const sentences = this._splitIntoSentences(response);
      
      if (sentences.length === 0) {
        return 0;
      }

      if (sentences.length === 1) {
        return 0.8; // Single sentence gets good coherence by default
      }

      let coherenceScore = 0;
      let factors = 0;

      // Factor 1: Sentence length consistency (avoid extreme variations)
      const sentenceLengths = sentences.map(s => s.length);
      const avgLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
      const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
      const lengthConsistency = Math.max(0, 1 - (lengthVariance / (avgLength * avgLength)));
      coherenceScore += lengthConsistency * 0.3;
      factors += 0.3;

      // Factor 2: Transition words and phrases
      const transitionWords = [
        'however', 'furthermore', 'moreover', 'therefore', 'consequently',
        'additionally', 'meanwhile', 'subsequently', 'nevertheless', 'thus',
        'first', 'second', 'finally', 'in conclusion', 'on the other hand',
        'for example', 'in contrast', 'similarly', 'as a result'
      ];
      
      const transitionCount = transitionWords.reduce((count, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return count + (response.match(regex) || []).length;
      }, 0);
      
      const transitionScore = Math.min(1, transitionCount / (sentences.length * 0.3));
      coherenceScore += transitionScore * 0.2;
      factors += 0.2;

      // Factor 3: Repetitive content detection (penalize redundancy)
      const words = response.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const uniquenessRatio = uniqueWords.size / words.length;
      const repetitionScore = Math.min(1, uniquenessRatio * 1.5);
      coherenceScore += repetitionScore * 0.2;
      factors += 0.2;

      // Factor 4: Logical structure (introduction, body, conclusion patterns)
      let structureScore = 0.5; // Base score
      
      // Check for conclusion indicators
      const conclusionIndicators = ['in conclusion', 'finally', 'to summarize', 'overall', 'in summary'];
      const hasConclusion = conclusionIndicators.some(indicator => 
        response.toLowerCase().includes(indicator)
      );
      
      if (hasConclusion && sentences.length > 2) {
        structureScore += 0.3;
      }

      // Check for enumeration/listing
      const hasEnumeration = /\b(first|second|third|1\.|2\.|3\.|\d+\))/i.test(response);
      if (hasEnumeration) {
        structureScore += 0.2;
      }

      structureScore = Math.min(1, structureScore);
      coherenceScore += structureScore * 0.3;
      factors += 0.3;

      return Math.min(1, Math.max(0, coherenceScore / factors));
    } catch (error) {
      logger.error('Error calculating coherence:', error);
      return 0.5; // Default fallback
    }
  }

  /**
   * Calculate completeness score (how well the response addresses the prompt)
   * @param {string} response - Response text
   * @param {string} prompt - Original prompt
   * @returns {Promise<number>} Completeness score (0-1)
   */
  async calculateCompleteness(response, prompt) {
    try {
      const promptWords = this._extractKeywords(prompt.toLowerCase());
      const responseWords = this._extractKeywords(response.toLowerCase());
      
      if (promptWords.length === 0) {
        return 0.7; // Default if prompt has no keywords
      }

      // Factor 1: Keyword coverage
      const keywordMatches = promptWords.filter(word => 
        responseWords.includes(word) || 
        responseWords.some(rWord => this._isSimilar(word, rWord))
      );
      
      const keywordCoverage = keywordMatches.length / promptWords.length;

      // Factor 2: Response length appropriateness relative to prompt complexity
      const promptComplexity = this._assessPromptComplexity(prompt);
      const expectedMinLength = promptComplexity * 50; // Base expectation
      const lengthAdequacy = Math.min(1, response.length / expectedMinLength);

      // Factor 3: Question answering (if prompt contains questions)
      const questions = prompt.match(/\?/g) || [];
      let questionScore = 1;
      
      if (questions.length > 0) {
        // Check if response attempts to answer questions
        const answerIndicators = ['yes', 'no', 'because', 'the answer', 'this is', 'it is', 'they are'];
        const hasAnswers = answerIndicators.some(indicator => 
          response.toLowerCase().includes(indicator)
        );
        questionScore = hasAnswers ? 1 : 0.6;
      }

      // Weighted combination
      const completenessScore = (
        keywordCoverage * 0.4 +
        lengthAdequacy * 0.3 +
        questionScore * 0.3
      );

      return Math.min(1, Math.max(0, completenessScore));
    } catch (error) {
      logger.error('Error calculating completeness:', error);
      return 0.5;
    }
  }

  /**
   * Calculate readability score (ease of understanding)
   * @param {string} response - Response text
   * @returns {Promise<number>} Readability score (0-1)
   */
  async calculateReadability(response) {
    try {
      const sentences = this._splitIntoSentences(response);
      const words = response.split(/\s+/).filter(word => word.length > 0);
      const syllables = this._countSyllables(response);

      if (sentences.length === 0 || words.length === 0) {
        return 0;
      }

      // Flesch Reading Ease approximation
      const avgWordsPerSentence = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;

      const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
      
      // Convert Flesch score to 0-1 scale
      let readabilityScore = Math.max(0, Math.min(100, fleschScore)) / 100;

      // Additional factors
      
      // Factor 1: Sentence length variation (moderate variation is good)
      const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
      const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
      const sentenceLengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
      const optimalVariance = avgSentenceLength * 0.5; // Optimal variance
      const variationScore = 1 - Math.abs(sentenceLengthVariance - optimalVariance) / optimalVariance;
      
      // Factor 2: Use of simple vs complex words
      const simpleWords = words.filter(word => word.length <= 6).length;
      const simplicityScore = simpleWords / words.length;

      // Factor 3: Proper punctuation usage
      const punctuationMarks = response.match(/[.!?,:;]/g) || [];
      const punctuationScore = Math.min(1, punctuationMarks.length / (sentences.length * 2));

      // Weighted combination
      const finalScore = (
        readabilityScore * 0.5 +
        Math.max(0, Math.min(1, variationScore)) * 0.2 +
        simplicityScore * 0.2 +
        punctuationScore * 0.1
      );

      return Math.min(1, Math.max(0, finalScore));
    } catch (error) {
      logger.error('Error calculating readability:', error);
      return 0.5;
    }
  }

  /**
   * Calculate creativity score (originality and innovation)
   * @param {string} response - Response text
   * @returns {Promise<number>} Creativity score (0-1)
   */
  async calculateCreativity(response) {
    try {
      const words = response.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      
      if (words.length === 0) {
        return 0;
      }

      // Factor 1: Vocabulary diversity (unique words)
      const uniqueWords = new Set(words);
      const vocabularyDiversity = uniqueWords.size / words.length;

      // Factor 2: Use of uncommon words (longer words tend to be less common)
      const uncommonWords = words.filter(word => word.length > 7);
      const uncommonWordRatio = uncommonWords.length / words.length;

      // Factor 3: Creative language patterns
      const creativePatterns = [
        /metaphor|analogy|like|as if|reminds me of/gi,
        /imagine|envision|picture|visualize/gi,
        /creative|innovative|unique|original|novel/gi,
        /surprisingly|unexpectedly|remarkably|interestingly/gi
      ];

      const patternMatches = creativePatterns.reduce((count, pattern) => {
        return count + (response.match(pattern) || []).length;
      }, 0);

      const patternScore = Math.min(1, patternMatches / 3);

      // Factor 4: Varied sentence structures
      const sentences = this._splitIntoSentences(response);
      const sentenceStarters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
      const uniqueStarters = new Set(sentenceStarters);
      const starterDiversity = sentences.length > 1 ? uniqueStarters.size / sentences.length : 0.5;

      // Factor 5: Absence of clichés and common phrases
      const cliches = [
        'in conclusion', 'first of all', 'last but not least', 'at the end of the day',
        'it goes without saying', 'needless to say', 'to make a long story short'
      ];
      
      const clicheCount = cliches.reduce((count, cliche) => {
        return count + (response.toLowerCase().includes(cliche) ? 1 : 0);
      }, 0);
      
      const clichePenalty = Math.max(0, 1 - (clicheCount * 0.2));

      // Weighted combination
      const creativityScore = (
        vocabularyDiversity * 0.25 +
        uncommonWordRatio * 0.2 +
        patternScore * 0.25 +
        starterDiversity * 0.15 +
        clichePenalty * 0.15
      );

      return Math.min(1, Math.max(0, creativityScore));
    } catch (error) {
      logger.error('Error calculating creativity:', error);
      return 0.5;
    }
  }

  /**
   * Calculate specificity score (concrete vs vague language)
   * @param {string} response - Response text
   * @returns {Promise<number>} Specificity score (0-1)
   */
  async calculateSpecificity(response) {
    try {
      const words = response.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      
      if (words.length === 0) {
        return 0;
      }

      // Factor 1: Specific vs vague words
      const vageWords = [
        'some', 'many', 'few', 'several', 'various', 'different', 'numerous',
        'thing', 'stuff', 'something', 'anything', 'everything',
        'good', 'bad', 'nice', 'great', 'big', 'small', 'large',
        'very', 'quite', 'rather', 'somewhat', 'pretty', 'fairly'
      ];

      const specificIndicators = [
        /\d+/g, // Numbers
        /\b[A-Z][a-z]+\b/g, // Proper nouns (capitalized words)
        /\b\w+ly\b/g, // Adverbs (often more specific)
        /%|percent|dollar|meter|feet|pound|kilogram/gi // Units and measurements
      ];

      const vageWordCount = vageWords.reduce((count, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return count + (response.match(regex) || []).length;
      }, 0);

      const specificMatches = specificIndicators.reduce((count, pattern) => {
        return count + (response.match(pattern) || []).length;
      }, 0);

      const vaguenessRatio = vageWordCount / words.length;
      const specificityRatio = specificMatches / words.length;

      // Factor 2: Concrete nouns vs abstract concepts
      const concreteNouns = words.filter(word => {
        // Simple heuristic: concrete nouns tend to be shorter and more common
        return word.length >= 3 && word.length <= 8 && 
               !/ing$|tion$|ness$|ity$|ment$/.test(word);
      });

      const concreteRatio = concreteNouns.length / words.length;

      // Factor 3: Examples and illustrations
      const exampleIndicators = [
        'for example', 'such as', 'including', 'like', 'specifically',
        'in particular', 'namely', 'instance', 'case in point'
      ];

      const exampleCount = exampleIndicators.reduce((count, indicator) => {
        return count + (response.toLowerCase().includes(indicator) ? 1 : 0);
      }, 0);

      const exampleScore = Math.min(1, exampleCount / 3);

      // Weighted combination (penalize vagueness, reward specificity)
      const specificityScore = (
        (1 - vaguenessRatio) * 0.3 +
        specificityRatio * 0.3 +
        concreteRatio * 0.2 +
        exampleScore * 0.2
      );

      return Math.min(1, Math.max(0, specificityScore));
    } catch (error) {
      logger.error('Error calculating specificity:', error);
      return 0.5;
    }
  }

  /**
   * Calculate length appropriateness score
   * @param {string} response - Response text
   * @param {string} prompt - Original prompt
   * @returns {Promise<number>} Length appropriateness score (0-1)
   */
  async calculateLengthAppropriateness(response, prompt) {
    try {
      const responseLength = response.length;
      const promptComplexity = this._assessPromptComplexity(prompt);
      
      // Determine expected length based on prompt complexity
      let expectedLength;
      if (promptComplexity <= 1) {
        expectedLength = 100; // Simple prompts: 50-150 chars
      } else if (promptComplexity <= 2) {
        expectedLength = 200; // Medium prompts: 100-300 chars
      } else {
        expectedLength = 400; // Complex prompts: 200-600 chars
      }

      // Calculate how close the response length is to the expected length
      const lengthRatio = responseLength / expectedLength;
      
      let appropriatenessScore;
      
      if (lengthRatio >= 0.5 && lengthRatio <= 2.0) {
        // Optimal range: 50% to 200% of expected length
        appropriatenessScore = 1.0;
      } else if (lengthRatio >= 0.3 && lengthRatio <= 3.0) {
        // Acceptable range: 30% to 300% of expected length
        const distance = Math.min(
          Math.abs(lengthRatio - 0.5),
          Math.abs(lengthRatio - 2.0)
        );
        appropriatenessScore = 1.0 - (distance * 0.5);
      } else {
        // Outside acceptable range
        const distance = lengthRatio < 0.3 ? 0.3 - lengthRatio : lengthRatio - 3.0;
        appropriatenessScore = Math.max(0, 0.5 - (distance * 0.2));
      }

      // Additional factor: Completeness vs brevity balance
      const words = response.split(/\s+/).length;
      const sentences = this._splitIntoSentences(response).length;
      
      if (sentences > 0) {
        const avgWordsPerSentence = words / sentences;
        
        // Optimal sentence length is 15-25 words
        const sentenceLengthScore = avgWordsPerSentence >= 10 && avgWordsPerSentence <= 30 ? 1.0 :
                                   avgWordsPerSentence >= 5 && avgWordsPerSentence <= 40 ? 0.8 : 0.6;
        
        appropriatenessScore = appropriatenessScore * 0.8 + sentenceLengthScore * 0.2;
      }

      return Math.min(1, Math.max(0, appropriatenessScore));
    } catch (error) {
      logger.error('Error calculating length appropriateness:', error);
      return 0.5;
    }
  }

  // Helper methods

  /**
   * Split text into sentences
   * @private
   */
  _splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  /**
   * Extract keywords from text
   * @private
   */
  _extractKeywords(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Check if two words are similar
   * @private
   */
  _isSimilar(word1, word2) {
    // Simple similarity check (could be enhanced with more sophisticated algorithms)
    return word1.includes(word2) || word2.includes(word1);
  }

  /**
   * Assess prompt complexity
   * @private
   */
  _assessPromptComplexity(prompt) {
    const questions = (prompt.match(/\?/g) || []).length;
    const sentences = this._splitIntoSentences(prompt).length;
    const words = prompt.split(/\s+/).length;
    
    // Simple complexity scoring
    let complexity = 1;
    
    if (questions > 1) complexity += 0.5;
    if (sentences > 2) complexity += 0.5;
    if (words > 50) complexity += 0.5;
    if (words > 100) complexity += 0.5;
    
    return Math.min(3, complexity);
  }

  /**
   * Count syllables in text (approximation)
   * @private
   */
  _countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      // Simple syllable counting approximation
      const vowels = word.match(/[aeiouy]+/g) || [];
      const syllableCount = Math.max(1, vowels.length);
      return total + syllableCount;
    }, 0);
  }
}

// Create and export singleton instance
const qualityMetricsService = new QualityMetricsService();
module.exports = qualityMetricsService;
