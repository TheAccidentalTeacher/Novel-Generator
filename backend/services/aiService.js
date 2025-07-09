const OpenAI = require('openai');
const winston = require('winston');

class AIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID || undefined,
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/ai-service.log' })
      ]
    });

    // Model configurations
    this.models = {
      planning: 'gpt-4-1106-preview', // GPT-4.1 for planning
      drafting: 'gpt-4', // GPT-4.0 for drafting  
      reviewing: 'gpt-4-1106-preview', // GPT-4.1 for reviewing
      image: 'dall-e-3'
    };

    this.defaultSettings = {
      temperature: parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7,
      maxTokens: {
        planning: parseInt(process.env.MAX_TOKENS_GPT4_TURBO) || 8192,
        drafting: parseInt(process.env.MAX_TOKENS_GPT4) || 4096,
        reviewing: parseInt(process.env.MAX_TOKENS_GPT4_TURBO) || 8192
      }
    };
  }

  /**
   * Generate a novel premise based on genre and user inputs
   */
  async generatePremise(genre, customization = {}, additionalInputs = '') {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPremisePrompt(genre, customization, additionalInputs);
      
      const response = await this.openai.chat.completions.create({
        model: this.models.planning,
        messages: [{ role: 'user', content: prompt }],
        temperature: customization.temperature || this.defaultSettings.temperature,
        max_tokens: this.defaultSettings.maxTokens.planning,
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Premise generated', {
        genre: genre.name,
        tokensUsed: response.usage.total_tokens,
        generationTime,
        model: this.models.planning
      });

      return {
        premises: this.parsePremiseResponse(response.choices[0].message.content),
        metadata: {
          model: this.models.planning,
          tokensUsed: response.usage.total_tokens,
          generationTime,
          temperature: customization.temperature || this.defaultSettings.temperature
        }
      };

    } catch (error) {
      this.logger.error('Premise generation failed', { error: error.message, genre: genre.name });
      throw new Error(`Failed to generate premise: ${error.message}`);
    }
  }

  /**
   * Generate detailed novel outline
   */
  async generateOutline(premise, genre, characters, customization = {}) {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildOutlinePrompt(premise, genre, characters, customization);
      
      const response = await this.openai.chat.completions.create({
        model: this.models.planning,
        messages: [{ role: 'user', content: prompt }],
        temperature: customization.temperature || this.defaultSettings.temperature,
        max_tokens: this.defaultSettings.maxTokens.planning,
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Outline generated', {
        premise: premise.substring(0, 100),
        tokensUsed: response.usage.total_tokens,
        generationTime,
        model: this.models.planning
      });

      return {
        outline: this.parseOutlineResponse(response.choices[0].message.content),
        metadata: {
          model: this.models.planning,
          tokensUsed: response.usage.total_tokens,
          generationTime,
          temperature: customization.temperature || this.defaultSettings.temperature
        }
      };

    } catch (error) {
      this.logger.error('Outline generation failed', { error: error.message });
      throw new Error(`Failed to generate outline: ${error.message}`);
    }
  }

  /**
   * Generate character profiles
   */
  async generateCharacters(premise, genre, outline, customization = {}) {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildCharacterPrompt(premise, genre, outline, customization);
      
      const response = await this.openai.chat.completions.create({
        model: this.models.planning,
        messages: [{ role: 'user', content: prompt }],
        temperature: customization.temperature || this.defaultSettings.temperature,
        max_tokens: this.defaultSettings.maxTokens.planning,
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Characters generated', {
        tokensUsed: response.usage.total_tokens,
        generationTime,
        model: this.models.planning
      });

      return {
        characters: this.parseCharacterResponse(response.choices[0].message.content),
        metadata: {
          model: this.models.planning,
          tokensUsed: response.usage.total_tokens,
          generationTime,
          temperature: customization.temperature || this.defaultSettings.temperature
        }
      };

    } catch (error) {
      this.logger.error('Character generation failed', { error: error.message });
      throw new Error(`Failed to generate characters: ${error.message}`);
    }
  }

  /**
   * Generate a single chapter
   */
  async generateChapter(chapterOutline, context, customization = {}) {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildChapterPrompt(chapterOutline, context, customization);
      
      const response = await this.openai.chat.completions.create({
        model: this.models.drafting,
        messages: [{ role: 'user', content: prompt }],
        temperature: customization.temperature || this.defaultSettings.temperature,
        max_tokens: this.defaultSettings.maxTokens.drafting,
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Chapter generated', {
        chapterNumber: chapterOutline.number,
        tokensUsed: response.usage.total_tokens,
        generationTime,
        model: this.models.drafting
      });

      return {
        content: response.choices[0].message.content,
        metadata: {
          model: this.models.drafting,
          tokensUsed: response.usage.total_tokens,
          generationTime,
          temperature: customization.temperature || this.defaultSettings.temperature,
          prompt: prompt // Store for debugging
        }
      };

    } catch (error) {
      this.logger.error('Chapter generation failed', { 
        error: error.message, 
        chapterNumber: chapterOutline.number 
      });
      throw new Error(`Failed to generate chapter: ${error.message}`);
    }
  }

  /**
   * Review a generated chapter for quality
   */
  async reviewChapter(chapterContent, context, customization = {}) {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildReviewPrompt(chapterContent, context, customization);
      
      const response = await this.openai.chat.completions.create({
        model: this.models.reviewing,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Lower temperature for more consistent reviews
        max_tokens: this.defaultSettings.maxTokens.reviewing,
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Chapter reviewed', {
        tokensUsed: response.usage.total_tokens,
        generationTime,
        model: this.models.reviewing
      });

      return {
        review: this.parseReviewResponse(response.choices[0].message.content),
        metadata: {
          model: this.models.reviewing,
          tokensUsed: response.usage.total_tokens,
          generationTime,
          temperature: 0.3
        }
      };

    } catch (error) {
      this.logger.error('Chapter review failed', { error: error.message });
      throw new Error(`Failed to review chapter: ${error.message}`);
    }
  }

  /**
   * Generate book cover image
   */
  async generateCoverImage(prompt, settings = {}) {
    const startTime = Date.now();
    
    try {
      const response = await this.openai.images.generate({
        model: this.models.image,
        prompt: prompt,
        size: settings.size || '1024x1024',
        quality: settings.quality || 'standard',
        style: settings.style || 'natural',
        n: 1
      });

      const generationTime = Date.now() - startTime;
      
      this.logger.info('Cover image generated', {
        prompt: prompt.substring(0, 100),
        size: settings.size || '1024x1024',
        quality: settings.quality || 'standard',
        generationTime
      });

      return {
        imageUrl: response.data[0].url,
        revisedPrompt: response.data[0].revised_prompt,
        metadata: {
          model: this.models.image,
          generationTime,
          settings: {
            size: settings.size || '1024x1024',
            quality: settings.quality || 'standard',
            style: settings.style || 'natural'
          }
        }
      };

    } catch (error) {
      this.logger.error('Cover image generation failed', { error: error.message });
      throw new Error(`Failed to generate cover image: ${error.message}`);
    }
  }

  // Helper methods for building prompts
  buildPremisePrompt(genre, customization, additionalInputs) {
    const genreContext = genre.getPromptingContext('planning');
    
    const prompt = `You are an expert fiction writer specializing in ${genre.name}. Generate 3-5 compelling novel premises that adhere to the following genre requirements:

GENRE: ${genre.name}
DESCRIPTION: ${genreContext.definition}
KEY CHARACTERISTICS: ${genreContext.keyCharacteristics.join(', ')}

GENRE-SPECIFIC REQUIREMENTS:
${JSON.stringify(genreContext.specificGuidance, null, 2)}`;

    if (genreContext.christianElements) {
      prompt += `

CHRISTIAN FICTION REQUIREMENTS:
- Faith elements must be organic and authentic
- Characters should have realistic spiritual journeys
- Content must align with Christian values
- Include opportunities for spiritual growth and biblical principles`;
    }

    prompt += `

CUSTOMIZATION PREFERENCES:
- Writing Style: ${customization.writingStyle || 'Balanced show-don\'t-tell approach'}
- Character Development: ${customization.characterDevelopment || 'Moderate depth'}
- Thematic Elements: ${customization.thematicElements || 'Standard genre themes'}`;

    if (additionalInputs) {
      prompt += `

ADDITIONAL REQUIREMENTS:
${additionalInputs}`;
    }

    prompt += `

For each premise, provide:
1. A compelling 2-3 sentence summary
2. The central conflict
3. Unique elements that avoid genre clichés
4. Potential for character development
5. Thematic possibilities

Format your response as JSON with this structure:
{
  "premises": [
    {
      "title": "Working Title",
      "summary": "2-3 sentence premise",
      "centralConflict": "Main conflict description",
      "uniqueElements": ["element1", "element2"],
      "characterPotential": "Development opportunities",
      "themes": ["theme1", "theme2"]
    }
  ]
}`;

    return prompt;
  }

  buildOutlinePrompt(premise, genre, characters, customization) {
    const genreContext = genre.getPromptingContext('planning');
    const targetChapters = Math.ceil((customization.wordCountTarget || 60000) / 2000);
    
    let prompt = `You are an expert fiction writer creating a detailed outline for a ${genre.name} novel.

PREMISE: ${premise}

GENRE REQUIREMENTS:
${JSON.stringify(genreContext, null, 2)}

TARGET STRUCTURE:
- Total chapters: ${targetChapters}
- Words per chapter: ${customization.chapterWordCount?.min || 1750}-${customization.chapterWordCount?.max || 2250}
- Overall word count: ${customization.wordCountTarget || 60000}

CHARACTERS PROVIDED:
${characters.map(char => `${char.name}: ${char.role} - ${char.description}`).join('\n')}

Create a comprehensive outline including:
1. Three-act structure with chapter breakdown
2. Character arcs mapped to plot progression
3. Key plot points and turning points
4. Thematic development throughout
5. Timeline and pacing notes

QUALITY REQUIREMENTS:
- Ensure each chapter has a clear purpose and mini-arc
- Plan for variety in scene types and settings
- Integrate character development naturally
- Avoid repetitive chapter structures
- Maximum one em dash per chapter (note in style guide)`;

    if (genreContext.christianElements) {
      prompt += `

CHRISTIAN FICTION INTEGRATION:
- Map spiritual growth to plot progression
- Include authentic faith challenges and resolutions
- Integrate biblical principles organically
- Plan witnessing and ministry opportunities`;
    }

    prompt += `

Format as detailed JSON with the specified structure.`;

    return prompt;
  }

  buildChapterPrompt(chapterOutline, context, customization) {
    const wordCountRange = `${customization.chapterWordCount?.min || 1750}-${customization.chapterWordCount?.max || 2250}`;
    
    let prompt = `You are an expert fiction writer crafting Chapter ${chapterOutline.number} of a ${context.genre.name} novel.

CHAPTER OUTLINE:
Title: ${chapterOutline.title}
Summary: ${chapterOutline.summary}
Objectives: ${chapterOutline.objectives.join(', ')}
Word Count Target: ${wordCountRange} words

NOVEL CONTEXT:
Premise: ${context.premise}
Characters: ${context.characters.map(c => `${c.name} (${c.role})`).join(', ')}

PREVIOUS CHAPTER CONTEXT:
${context.previousChapter ? `Previous chapter summary: ${context.previousChapter.summary}` : 'This is the first chapter.'}

QUALITY REQUIREMENTS (CRITICAL):
1. Word count: MUST be between ${wordCountRange} words
2. Em dashes: Maximum ONE em dash (—) allowed in entire chapter
3. Use en dashes (–) for ranges and connections instead
4. No repeated phrases, sentence structures, or scene patterns
5. Show don't tell throughout
6. Natural, varied dialogue
7. Distinct scenes that serve the plot
8. Character-consistent voices and actions

STYLE GUIDELINES:
- Pacing: ${customization.pacingProfile || 'Moderate'}
- Dialogue frequency: ${customization.dialogueFrequency || 'Balanced'}
- Descriptive density: ${customization.descriptiveDensity || 'Moderate'}
- Show-don't-tell emphasis: High priority

GENRE-SPECIFIC REQUIREMENTS:
${JSON.stringify(context.genre.getPromptingContext('drafting'), null, 2)}

Write the complete chapter content, ensuring it:
- Starts with a compelling opening
- Develops the planned character arcs
- Advances the plot meaningfully
- Ends with appropriate transition/hook for next chapter
- Maintains consistency with established characters and world

Begin writing the chapter now:`;

    return prompt;
  }

  buildReviewPrompt(chapterContent, context, customization) {
    return `You are an expert editor reviewing Chapter ${context.chapterNumber} of a ${context.genre.name} novel.

CHAPTER CONTENT TO REVIEW:
${chapterContent}

REVIEW CRITERIA:
1. REPETITION ANALYSIS
   - Check for repeated phrases, words, or sentence structures
   - Identify any formulaic patterns
   - Score: 0-100 (100 = no repetition)

2. PUNCTUATION COMPLIANCE
   - Count em dashes (—) - should be maximum 1
   - Verify en dash (–) usage for ranges
   - Score: 0-100 (100 = perfect compliance)

3. NATURAL LANGUAGE
   - Identify artificial or template-like phrases
   - Check for varied sentence structures
   - Score: 0-100 (100 = completely natural)

4. CHARACTER CONSISTENCY
   - Verify characters act according to established profiles
   - Check dialogue authenticity
   - Score: 0-100 (100 = perfectly consistent)

5. PLOT ADHERENCE
   - Confirm chapter meets outlined objectives
   - Verify logical progression
   - Score: 0-100 (100 = perfectly aligned)

6. GENRE COMPLIANCE
   - Check adherence to ${context.genre.name} conventions
   - Verify appropriate tone and style
   - Score: 0-100 (100 = genre-perfect)

Provide detailed feedback in JSON format:
{
  "scores": {
    "repetition": number,
    "punctuation": number,
    "naturalLanguage": number,
    "characterConsistency": number,
    "plotAdherence": number,
    "genreCompliance": number,
    "overall": number
  },
  "issues": [
    {
      "type": "category",
      "severity": "low|medium|high",
      "description": "issue description",
      "suggestion": "how to fix"
    }
  ],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;
  }

  // Response parsing methods
  parsePremiseResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      this.logger.error('Failed to parse premise response', { error: error.message, content });
      throw new Error('Invalid premise response format');
    }
  }

  parseOutlineResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      this.logger.error('Failed to parse outline response', { error: error.message });
      throw new Error('Invalid outline response format');
    }
  }

  parseCharacterResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      this.logger.error('Failed to parse character response', { error: error.message });
      throw new Error('Invalid character response format');
    }
  }

  parseReviewResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      this.logger.error('Failed to parse review response', { error: error.message });
      throw new Error('Invalid review response format');
    }
  }

  /**
   * Calculate text statistics for quality analysis
   */
  calculateTextStatistics(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Calculate lexical diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = uniqueWords.size / words.length;
    
    // Count punctuation
    const emDashes = (text.match(/—/g) || []).length;
    const enDashes = (text.match(/–/g) || []).length;
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      lexicalDiversity: Math.round(lexicalDiversity * 100),
      punctuation: {
        emDashes,
        enDashes,
        compliant: emDashes <= 1
      },
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      averageSentencesPerParagraph: Math.round(sentences.length / paragraphs.length)
    };
  }
}

module.exports = new AIService();
