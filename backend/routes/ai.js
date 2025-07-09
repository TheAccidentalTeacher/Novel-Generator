const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Novel = require('../models/Novel');
const Genre = require('../models/Genre');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai.log' })
  ]
});

// POST /api/ai/generate-premise - Generate novel premises
router.post('/generate-premise', async (req, res) => {
  try {
    const { genreId, customization = {}, additionalInputs = '' } = req.body;

    if (!genreId) {
      return res.status(400).json({ message: 'Genre ID is required' });
    }

    const genre = await Genre.findById(genreId);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    const result = await aiService.generatePremise(genre, customization, additionalInputs);

    logger.info('Premises generated', { 
      genreId, 
      count: result.premises.premises.length,
      tokensUsed: result.metadata.tokensUsed 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating premise', { error: error.message, genreId: req.body.genreId });
    res.status(500).json({ message: 'Failed to generate premise', error: error.message });
  }
});

// POST /api/ai/generate-outline - Generate novel outline
router.post('/generate-outline', async (req, res) => {
  try {
    const { novelId, premise, customization = {} } = req.body;

    if (!novelId || !premise) {
      return res.status(400).json({ message: 'Novel ID and premise are required' });
    }

    const novel = await Novel.findById(novelId)
      .populate('characters')
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    // Use genre from novel if available
    const genre = novel.genre || await Genre.findById(req.body.genreId);
    if (!genre) {
      return res.status(400).json({ message: 'Genre information not available' });
    }

    const result = await aiService.generateOutline(
      premise, 
      genre, 
      novel.characters, 
      customization
    );

    // Update novel with generated outline
    novel.outline = result.outline;
    novel.premise = premise;
    novel.status = 'outlining';
    await novel.save();

    logger.info('Outline generated', { 
      novelId, 
      tokensUsed: result.metadata.tokensUsed 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating outline', { 
      error: error.message, 
      novelId: req.body.novelId 
    });
    res.status(500).json({ message: 'Failed to generate outline', error: error.message });
  }
});

// POST /api/ai/generate-characters - Generate character profiles
router.post('/generate-characters', async (req, res) => {
  try {
    const { novelId, premise, outline, customization = {} } = req.body;

    if (!novelId || !premise) {
      return res.status(400).json({ message: 'Novel ID and premise are required' });
    }

    const novel = await Novel.findById(novelId)
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    const genre = novel.genre;
    if (!genre) {
      return res.status(400).json({ message: 'Genre information not available' });
    }

    const result = await aiService.generateCharacters(
      premise, 
      genre, 
      outline || novel.outline, 
      customization
    );

    logger.info('Characters generated', { 
      novelId, 
      count: result.characters.characters?.length || 0,
      tokensUsed: result.metadata.tokensUsed 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating characters', { 
      error: error.message, 
      novelId: req.body.novelId 
    });
    res.status(500).json({ message: 'Failed to generate characters', error: error.message });
  }
});

// POST /api/ai/generate-chapter - Generate single chapter
router.post('/generate-chapter', async (req, res) => {
  try {
    const { 
      novelId, 
      chapterNumber, 
      chapterOutline, 
      customization = {},
      customInstructions 
    } = req.body;

    if (!novelId || !chapterNumber || !chapterOutline) {
      return res.status(400).json({ 
        message: 'Novel ID, chapter number, and chapter outline are required' 
      });
    }

    const novel = await Novel.findById(novelId)
      .populate('characters')
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    // Get previous chapters for context
    const Chapter = require('../models/Chapter');
    const previousChapters = await Chapter.getContextForGeneration(novelId, chapterNumber);
    
    const context = {
      genre: novel.genre,
      premise: novel.premise,
      characters: novel.characters,
      previousChapter: previousChapters[0] || null
    };

    // Merge custom instructions
    const finalCustomization = { 
      ...novel.settings.customization,
      ...customization,
      additionalInstructions: customInstructions 
    };

    const result = await aiService.generateChapter(
      chapterOutline, 
      context, 
      finalCustomization
    );

    logger.info('Chapter generated via AI endpoint', { 
      novelId, 
      chapterNumber,
      tokensUsed: result.metadata.tokensUsed 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating chapter via AI endpoint', { 
      error: error.message, 
      novelId: req.body.novelId,
      chapterNumber: req.body.chapterNumber 
    });
    res.status(500).json({ message: 'Failed to generate chapter', error: error.message });
  }
});

// POST /api/ai/review-chapter - Review chapter content
router.post('/review-chapter', async (req, res) => {
  try {
    const { chapterContent, context, customization = {} } = req.body;

    if (!chapterContent || !context) {
      return res.status(400).json({ message: 'Chapter content and context are required' });
    }

    const result = await aiService.reviewChapter(chapterContent, context, customization);

    logger.info('Chapter reviewed via AI endpoint', { 
      tokensUsed: result.metadata.tokensUsed,
      overallScore: result.review.scores.overall 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error reviewing chapter via AI endpoint', { error: error.message });
    res.status(500).json({ message: 'Failed to review chapter', error: error.message });
  }
});

// POST /api/ai/generate-cover - Generate book cover
router.post('/generate-cover', async (req, res) => {
  try {
    const { prompt, settings = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const result = await aiService.generateCoverImage(prompt, settings);

    logger.info('Cover generated via AI endpoint', { 
      promptLength: prompt.length,
      size: settings.size || '1024x1024' 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating cover via AI endpoint', { error: error.message });
    res.status(500).json({ message: 'Failed to generate cover', error: error.message });
  }
});

// POST /api/ai/analyze-text - Analyze text for quality metrics
router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const statistics = aiService.calculateTextStatistics(text);

    logger.info('Text analyzed', { 
      wordCount: statistics.wordCount,
      lexicalDiversity: statistics.lexicalDiversity 
    });

    res.json({ statistics });
  } catch (error) {
    logger.error('Error analyzing text', { error: error.message });
    res.status(500).json({ message: 'Failed to analyze text', error: error.message });
  }
});

// GET /api/ai/models - Get available AI models
router.get('/models', (req, res) => {
  try {
    const models = {
      planning: 'gpt-4-1106-preview',
      drafting: 'gpt-4',
      reviewing: 'gpt-4-1106-preview',
      image: 'dall-e-3'
    };

    res.json({ models });
  } catch (error) {
    logger.error('Error fetching models', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch models', error: error.message });
  }
});

// GET /api/ai/usage - Get API usage statistics (placeholder for future implementation)
router.get('/usage', (req, res) => {
  try {
    // This would typically connect to a usage tracking service
    const usage = {
      tokensUsed: 0,
      imagesGenerated: 0,
      requestsToday: 0,
      costEstimate: 0
    };

    res.json({ usage });
  } catch (error) {
    logger.error('Error fetching usage', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch usage', error: error.message });
  }
});

// GET /api/ai/providers - Get available AI providers and models
router.get('/providers', async (req, res) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    logger.error('Error fetching providers', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch providers', error: error.message });
  }
});

// POST /api/ai/generate-text - Generate text with provider choice
router.post('/generate-text', async (req, res) => {
  try {
    const { 
      prompt, 
      provider = 'openai', 
      model, 
      maxTokens = 2000, 
      temperature = 0.7,
      systemPrompt = ''
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const result = await aiService.generateTextWithProvider(prompt, {
      provider,
      model,
      maxTokens,
      temperature,
      systemPrompt
    });

    logger.info('Text generated with provider', { 
      provider, 
      model,
      tokensUsed: result.tokensUsed 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating text with provider', { error: error.message });
    res.status(500).json({ message: 'Failed to generate text', error: error.message });
  }
});

// POST /api/ai/generate-cover-art - Generate cover art with Replicate
router.post('/generate-cover-art', async (req, res) => {
  try {
    const { 
      prompt, 
      provider = 'replicate',
      model = 'flux_dev',
      width = 512,
      height = 768,
      numImages = 1,
      guidance = 7.5,
      steps = 20
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const result = await aiService.generateCoverImage(prompt, {
      provider,
      model,
      width,
      height,
      numImages,
      guidance,
      steps
    });

    logger.info('Cover art generated', { 
      provider, 
      model,
      imagesGenerated: result.images?.length || 1
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating cover art', { error: error.message });
    res.status(500).json({ message: 'Failed to generate cover art', error: error.message });
  }
});

// POST /api/ai/text-variations - Generate multiple text variations
router.post('/text-variations', async (req, res) => {
  try {
    const { 
      prompt, 
      models = ['llama3_70b', 'mixtral_8x7b'],
      count = 2,
      maxTokens = 2000,
      temperature = 0.7
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const replicateService = require('../services/replicateService');
    const result = await replicateService.generateTextVariations(prompt, {
      models,
      count,
      maxTokens,
      temperature
    });

    logger.info('Text variations generated', { 
      modelsUsed: models,
      variationsGenerated: result.totalCount
    });

    res.json(result);
  } catch (error) {
    logger.error('Error generating text variations', { error: error.message });
    res.status(500).json({ message: 'Failed to generate text variations', error: error.message });
  }
});

module.exports = router;
