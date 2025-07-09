const express = require('express');
const router = express.Router();
const Cover = require('../models/Cover');
const Novel = require('../models/Novel');
const aiService = require('../services/aiService');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/covers.log' })
  ]
});

// GET /api/covers/:novelId - Get covers for a novel
router.get('/:novelId', async (req, res) => {
  try {
    const covers = await Cover.find({ novel: req.params.novelId })
      .sort({ createdAt: -1 });

    res.json(covers);
  } catch (error) {
    logger.error('Error fetching covers', { error: error.message, novelId: req.params.novelId });
    res.status(500).json({ message: 'Failed to fetch covers', error: error.message });
  }
});

// GET /api/covers/cover/:coverId - Get specific cover
router.get('/cover/:coverId', async (req, res) => {
  try {
    const cover = await Cover.findById(req.params.coverId);
    
    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    res.json(cover);
  } catch (error) {
    logger.error('Error fetching cover', { error: error.message, coverId: req.params.coverId });
    res.status(500).json({ message: 'Failed to fetch cover', error: error.message });
  }
});

// POST /api/covers/:novelId/generate - Generate new cover
router.post('/:novelId/generate', async (req, res) => {
  try {
    const { approach, template, prompt, extractedElements, settings = {} } = req.body;

    if (!approach || !['template-based', 'custom-prompt', 'automated-extraction'].includes(approach)) {
      return res.status(400).json({ 
        message: 'Valid approach is required (template-based, custom-prompt, automated-extraction)' 
      });
    }

    const novel = await Novel.findById(req.params.novelId)
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    let finalPrompt = '';
    let coverData = {
      novel: req.params.novelId,
      title: novel.title,
      design: {
        approach
      }
    };

    // Build prompt based on approach
    switch (approach) {
      case 'template-based':
        if (!template) {
          return res.status(400).json({ message: 'Template is required for template-based approach' });
        }
        finalPrompt = buildTemplatePrompt(template, novel);
        coverData.design.template = template;
        break;

      case 'custom-prompt':
        if (!prompt) {
          return res.status(400).json({ message: 'Prompt is required for custom-prompt approach' });
        }
        finalPrompt = enhanceCustomPrompt(prompt, novel);
        coverData.design.prompt = {
          original: prompt,
          enhanced: finalPrompt
        };
        break;

      case 'automated-extraction':
        finalPrompt = await buildExtractionPrompt(novel, extractedElements);
        coverData.design.extractedElements = extractedElements || [];
        break;
    }

    // Generate cover image
    const imageResult = await aiService.generateCoverImage(finalPrompt, settings);

    // Save cover data
    coverData.images = {
      base: {
        url: imageResult.imageUrl,
        dallePrompt: finalPrompt,
        dalleSettings: {
          model: 'dall-e-3',
          size: settings.size || '1024x1024',
          quality: settings.quality || 'standard',
          style: settings.style || 'natural'
        },
        generatedAt: new Date()
      }
    };

    coverData.metadata = {
      totalGenerationTime: imageResult.metadata.generationTime,
      dalleApiCalls: 1,
      iterations: 1
    };

    const cover = new Cover(coverData);
    await cover.save();

    // Update novel with cover reference
    novel.cover = cover._id;
    await novel.save();

    logger.info('Cover generated', { 
      novelId: req.params.novelId,
      coverId: cover._id,
      approach,
      promptLength: finalPrompt.length 
    });

    res.status(201).json(cover);
  } catch (error) {
    logger.error('Error generating cover', { 
      error: error.message, 
      novelId: req.params.novelId 
    });
    res.status(500).json({ message: 'Failed to generate cover', error: error.message });
  }
});

// POST /api/covers/:coverId/generate-variation - Generate cover variation
router.post('/:coverId/generate-variation', async (req, res) => {
  try {
    const { modifications, settings = {} } = req.body;

    const cover = await Cover.findById(req.params.coverId);
    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    // Build modified prompt
    let modifiedPrompt = cover.images.base.dallePrompt;
    if (modifications) {
      modifiedPrompt += ` ${modifications}`;
    }

    // Generate variation
    const imageResult = await aiService.generateCoverImage(modifiedPrompt, settings);

    // Add variation to cover
    const variation = {
      version: cover.images.variations.length + 1,
      url: imageResult.imageUrl,
      modifications,
      prompt: modifiedPrompt,
      generatedAt: new Date()
    };

    cover.images.variations.push(variation);
    cover.metadata.dalleApiCalls += 1;
    cover.metadata.iterations += 1;
    cover.metadata.totalGenerationTime += imageResult.metadata.generationTime;

    await cover.save();

    logger.info('Cover variation generated', { 
      coverId: req.params.coverId,
      variationNumber: variation.version 
    });

    res.json(variation);
  } catch (error) {
    logger.error('Error generating cover variation', { 
      error: error.message, 
      coverId: req.params.coverId 
    });
    res.status(500).json({ message: 'Failed to generate cover variation', error: error.message });
  }
});

// PUT /api/covers/:coverId - Update cover
router.put('/:coverId', async (req, res) => {
  try {
    const cover = await Cover.findByIdAndUpdate(
      req.params.coverId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    logger.info('Cover updated', { coverId: cover._id });
    res.json(cover);
  } catch (error) {
    logger.error('Error updating cover', { error: error.message, coverId: req.params.coverId });
    res.status(500).json({ message: 'Failed to update cover', error: error.message });
  }
});

// POST /api/covers/:coverId/approve - Approve cover
router.post('/:coverId/approve', async (req, res) => {
  try {
    const { feedback } = req.body;

    const cover = await Cover.findById(req.params.coverId);
    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    cover.approval.status = 'approved';
    cover.approval.feedback = feedback;
    cover.approval.approvedAt = new Date();

    await cover.save();

    logger.info('Cover approved', { coverId: cover._id });
    res.json(cover);
  } catch (error) {
    logger.error('Error approving cover', { error: error.message, coverId: req.params.coverId });
    res.status(500).json({ message: 'Failed to approve cover', error: error.message });
  }
});

// POST /api/covers/:coverId/reject - Reject cover
router.post('/:coverId/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const cover = await Cover.findById(req.params.coverId);
    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    cover.approval.status = 'rejected';
    cover.approval.rejectedReason = reason;

    await cover.save();

    logger.info('Cover rejected', { coverId: cover._id });
    res.json(cover);
  } catch (error) {
    logger.error('Error rejecting cover', { error: error.message, coverId: req.params.coverId });
    res.status(500).json({ message: 'Failed to reject cover', error: error.message });
  }
});

// DELETE /api/covers/:coverId - Delete cover
router.delete('/:coverId', async (req, res) => {
  try {
    const cover = await Cover.findById(req.params.coverId);
    if (!cover) {
      return res.status(404).json({ message: 'Cover not found' });
    }

    // Remove cover reference from novel
    await Novel.findByIdAndUpdate(cover.novel, { $unset: { cover: 1 } });

    await Cover.findByIdAndDelete(req.params.coverId);

    logger.info('Cover deleted', { coverId: req.params.coverId });
    res.json({ message: 'Cover deleted successfully' });
  } catch (error) {
    logger.error('Error deleting cover', { error: error.message, coverId: req.params.coverId });
    res.status(500).json({ message: 'Failed to delete cover', error: error.message });
  }
});

// Helper functions
function buildTemplatePrompt(template, novel) {
  const basePrompt = `Create a professional book cover for "${novel.title}", a ${novel.genre.primary} novel.`;
  
  // Add genre-specific elements
  let genreElements = '';
  switch (novel.genre.primary) {
    case 'Christian Fiction':
      genreElements = 'Include subtle Christian symbolism, warm and hopeful atmosphere, clean design.';
      break;
    case 'Mystery':
      genreElements = 'Include mysterious atmosphere, shadowy elements, intriguing visual clues.';
      break;
    case 'Cozy Mystery':
      genreElements = 'Include cozy, comfortable setting, charming atmosphere, approachable design.';
      break;
    case 'Romance':
      genreElements = 'Include romantic atmosphere, warm colors, elegant typography.';
      break;
    default:
      genreElements = 'Follow genre conventions and reader expectations.';
  }

  return `${basePrompt} ${genreElements} Style: ${template.name}. ${template.description || ''}`;
}

function enhanceCustomPrompt(prompt, novel) {
  const genreContext = `This is for a ${novel.genre.primary} novel titled "${novel.title}".`;
  const enhancement = 'Ensure professional book cover quality, clear typography space, marketable design.';
  
  return `${genreContext} ${prompt} ${enhancement}`;
}

async function buildExtractionPrompt(novel, extractedElements = []) {
  let prompt = `Create a professional book cover for "${novel.title}", a ${novel.genre.primary} novel.`;
  
  if (novel.premise) {
    prompt += ` Story premise: ${novel.premise.substring(0, 200)}...`;
  }

  if (extractedElements.length > 0) {
    const elements = extractedElements
      .filter(el => el.used)
      .map(el => el.description)
      .join(', ');
    prompt += ` Include these key elements: ${elements}.`;
  }

  prompt += ' Create a compelling, marketable cover that captures the essence of the story.';
  
  return prompt;
}

module.exports = router;
