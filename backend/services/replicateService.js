const Replicate = require('replicate');
const logger = require('./logger');

class ReplicateService {
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    // Model configurations
    this.models = {
      // Text Generation Models
      llama3_405b: "meta/meta-llama-3.1-405b-instruct",
      llama3_70b: "meta/meta-llama-3.1-70b-instruct", 
      llama3_8b: "meta/meta-llama-3.1-8b-instruct",
      mixtral_8x7b: "mistralai/mixtral-8x7b-instruct-v0.1",
      
      // Image Generation Models
      flux_pro: "black-forest-labs/flux-pro",
      flux_dev: "black-forest-labs/flux-dev",
      flux_schnell: "black-forest-labs/flux-schnell",
      sdxl: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      
      // Audio Models (for future features)
      whisper: "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
    };
  }

  /**
   * Generate text using Replicate models
   */
  async generateText(prompt, options = {}) {
    try {
      const {
        model = 'llama3_70b',
        maxTokens = 2000,
        temperature = 0.7,
        systemPrompt = ''
      } = options;

      const modelVersion = this.models[model];
      if (!modelVersion) {
        throw new Error(`Model ${model} not found`);
      }

      const input = {
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        max_new_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
        repetition_penalty: 1.1
      };

      logger.info(`Generating text with Replicate model: ${model}`);
      
      const output = await this.replicate.run(modelVersion, { input });
      
      // Replicate returns an array of strings, join them
      const result = Array.isArray(output) ? output.join('') : output;
      
      logger.info(`Text generation completed. Length: ${result.length} characters`);
      
      return {
        content: result,
        model: model,
        provider: 'replicate',
        tokensUsed: this.estimateTokens(result)
      };
      
    } catch (error) {
      logger.error('Replicate text generation error:', error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }

  /**
   * Generate cover art using Replicate image models
   */
  async generateCoverArt(prompt, options = {}) {
    try {
      const {
        model = 'flux_dev',
        width = 512,
        height = 768,
        numImages = 1,
        guidance = 7.5,
        steps = 20
      } = options;

      const modelVersion = this.models[model];
      if (!modelVersion) {
        throw new Error(`Image model ${model} not found`);
      }

      const input = {
        prompt: this.enhanceCoverPrompt(prompt),
        width: width,
        height: height,
        num_outputs: numImages,
        guidance_scale: guidance,
        num_inference_steps: steps
      };

      logger.info(`Generating cover art with Replicate model: ${model}`);
      
      const output = await this.replicate.run(modelVersion, { input });
      
      // Return URLs to generated images
      const images = Array.isArray(output) ? output : [output];
      
      logger.info(`Cover art generation completed. Generated ${images.length} images`);
      
      return {
        images: images,
        model: model,
        provider: 'replicate',
        prompt: input.prompt
      };
      
    } catch (error) {
      logger.error('Replicate cover art generation error:', error);
      throw new Error(`Cover art generation failed: ${error.message}`);
    }
  }

  /**
   * Generate multiple text options for comparison
   */
  async generateTextVariations(prompt, options = {}) {
    try {
      const {
        models = ['llama3_70b', 'mixtral_8x7b'],
        count = 2
      } = options;

      const variations = [];
      
      for (const model of models.slice(0, count)) {
        try {
          const result = await this.generateText(prompt, { ...options, model });
          variations.push(result);
        } catch (error) {
          logger.warn(`Failed to generate variation with ${model}:`, error.message);
        }
      }

      return {
        variations,
        totalCount: variations.length,
        originalPrompt: prompt
      };
      
    } catch (error) {
      logger.error('Replicate text variations error:', error);
      throw new Error(`Text variations generation failed: ${error.message}`);
    }
  }

  /**
   * Get available models and their capabilities
   */
  getAvailableModels() {
    return {
      text: {
        'llama3_405b': {
          name: 'Llama 3.1 405B',
          description: 'Most powerful model for complex creative writing',
          costTier: 'premium',
          maxTokens: 4096
        },
        'llama3_70b': {
          name: 'Llama 3.1 70B', 
          description: 'Great balance of quality and speed for novel writing',
          costTier: 'standard',
          maxTokens: 4096
        },
        'llama3_8b': {
          name: 'Llama 3.1 8B',
          description: 'Fast and efficient for quick content generation',
          costTier: 'budget',
          maxTokens: 2048
        },
        'mixtral_8x7b': {
          name: 'Mixtral 8x7B',
          description: 'Excellent for dialogue and character development',
          costTier: 'standard',
          maxTokens: 4096
        }
      },
      image: {
        'flux_pro': {
          name: 'FLUX.1 Pro',
          description: 'Highest quality image generation',
          costTier: 'premium'
        },
        'flux_dev': {
          name: 'FLUX.1 Dev',
          description: 'High quality, good balance',
          costTier: 'standard'
        },
        'flux_schnell': {
          name: 'FLUX.1 Schnell',
          description: 'Fast generation, good quality',
          costTier: 'budget'
        }
      }
    };
  }

  /**
   * Enhance cover art prompts for better results
   */
  enhanceCoverPrompt(prompt) {
    const enhancements = [
      'professional book cover design',
      'high quality',
      'detailed artwork',
      'commercial book cover style',
      'typography space at top and bottom'
    ];
    
    return `${prompt}, ${enhancements.join(', ')}`;
  }

  /**
   * Estimate token usage (rough approximation)
   */
  estimateTokens(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check service health
   */
  async healthCheck() {
    try {
      // Simple test with a small model
      const result = await this.generateText("Hello", {
        model: 'llama3_8b',
        maxTokens: 10
      });
      
      return {
        status: 'healthy',
        provider: 'replicate',
        testResult: result.content.substring(0, 50)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: 'replicate',
        error: error.message
      };
    }
  }
}

module.exports = new ReplicateService();
