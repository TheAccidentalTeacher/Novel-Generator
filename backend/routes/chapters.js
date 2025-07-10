const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const Character = require('../models/Character');
const aiService = require('../services/aiService');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/chapters.log' })
  ]
});

// GET /api/chapters/:novelId - Get chapters for a novel
router.get('/:novelId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const chapters = await Chapter.find({ novel: req.params.novelId })
      .sort({ number: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content.original -content.edited'); // Exclude large text fields by default

    const total = await Chapter.countDocuments({ novel: req.params.novelId });

    res.json({
      chapters,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Error fetching chapters', { error: error.message, novelId: req.params.novelId });
    res.status(500).json({ message: 'Failed to fetch chapters', error: error.message });
  }
});

// GET /api/chapters/:novelId/:chapterNumber - Get specific chapter
router.get('/:novelId/:chapterNumber', async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      novel: req.params.novelId,
      number: req.params.chapterNumber
    });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    logger.error('Error fetching chapter', { 
      error: error.message, 
      novelId: req.params.novelId,
      chapterNumber: req.params.chapterNumber 
    });
    res.status(500).json({ message: 'Failed to fetch chapter', error: error.message });
  }
});

// POST /api/chapters/:novelId/generate - Generate new chapter
router.post('/:novelId/generate', async (req, res) => {
  try {
    const { chapterNumber, customInstructions } = req.body;

    if (!chapterNumber) {
      return res.status(400).json({ message: 'Chapter number is required' });
    }

    // Check if chapter already exists
    const existingChapter = await Chapter.findOne({
      novel: req.params.novelId,
      number: chapterNumber
    });

    if (existingChapter) {
      return res.status(400).json({ message: 'Chapter already exists' });
    }

    const novel = await Novel.findById(req.params.novelId)
      .populate('characters')
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    // Get chapter outline
    const chapterOutline = getChapterOutline(novel, chapterNumber);
    if (!chapterOutline) {
      return res.status(400).json({ message: 'Chapter outline not found' });
    }

    // Get context for generation
    const previousChapters = await Chapter.getContextForGeneration(req.params.novelId, chapterNumber);
    
    const context = {
      genre: novel.genre,
      premise: novel.premise,
      characters: novel.characters,
      previousChapter: previousChapters[0] || null
    };

    // Add custom instructions if provided
    const customization = { 
      ...novel.settings.customization,
      additionalInstructions: customInstructions 
    };

    // Generate chapter content
    const result = await aiService.generateChapter(chapterOutline, context, customization);

    // Create chapter document
    const chapter = new Chapter({
      novel: req.params.novelId,
      number: chapterNumber,
      title: chapterOutline.title,
      content: {
        original: result.content,
        current: result.content
      },
      outline: {
        summary: chapterOutline.summary,
        objectives: chapterOutline.objectives || []
      },
      aiMetadata: result.metadata,
      status: 'generated'
    });

    await chapter.save();

    // Add chapter to novel
    await Novel.findByIdAndUpdate(req.params.novelId, {
      $push: { chapters: chapter._id },
      $inc: { 'progress.currentChapter': 1 }
    });

    logger.info('Chapter generated', { 
      novelId: req.params.novelId, 
      chapterNumber,
      chapterId: chapter._id 
    });

    res.status(201).json(chapter);
  } catch (error) {
    logger.error('Error generating chapter', { 
      error: error.message, 
      novelId: req.params.novelId,
      chapterNumber: req.body.chapterNumber 
    });
    res.status(500).json({ message: 'Failed to generate chapter', error: error.message });
  }
});

// POST /api/chapters/:novelId/generate-long - Generate long-form chapter (2000-4000 words)
router.post('/:novelId/generate-long', async (req, res) => {
  try {
    const { chapterNumber, customInstructions, targetWords } = req.body;

    if (!chapterNumber) {
      return res.status(400).json({ message: 'Chapter number is required' });
    }

    // Check if chapter already exists
    const existingChapter = await Chapter.findOne({
      novel: req.params.novelId,
      number: chapterNumber
    });

    if (existingChapter) {
      return res.status(400).json({ message: 'Chapter already exists' });
    }

    const novel = await Novel.findById(req.params.novelId)
      .populate('characters')
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    // Get chapter outline
    const chapterOutline = getChapterOutline(novel, chapterNumber);
    if (!chapterOutline) {
      return res.status(400).json({ message: 'Chapter outline not found' });
    }

    // Get context for generation
    const previousChapters = await Chapter.getContextForGeneration(req.params.novelId, chapterNumber);
    
    const context = {
      genre: novel.genre,
      premise: novel.premise,
      characters: novel.characters,
      previousChapter: previousChapters[0] || null
    };

    // Add custom instructions and target word count
    const customization = { 
      ...novel.settings.customization,
      additionalInstructions: customInstructions,
      targetWords: targetWords || 3000, // Default to 3000 words
      chapterWordCount: {
        min: 2000,
        max: 4000
      }
    };

    // Generate long chapter content
    const result = await aiService.generateLongChapter(chapterOutline, context, customization);

    // Create chapter document
    const chapter = new Chapter({
      novel: req.params.novelId,
      number: chapterNumber,
      title: chapterOutline.title,
      content: {
        original: result.content,
        current: result.content
      },
      outline: {
        summary: chapterOutline.summary,
        objectives: chapterOutline.objectives || []
      },
      aiMetadata: result.metadata,
      status: 'generated'
    });

    await chapter.save();

    // Add chapter to novel
    await Novel.findByIdAndUpdate(req.params.novelId, {
      $push: { chapters: chapter._id },
      $inc: { 'progress.currentChapter': 1 }
    });

    logger.info('Long chapter generated', { 
      novelId: req.params.novelId, 
      chapterNumber,
      chapterId: chapter._id,
      targetWords: customization.targetWords,
      maxTokens: result.metadata.maxTokens
    });

    res.status(201).json(chapter);
  } catch (error) {
    logger.error('Error generating long chapter', { 
      error: error.message, 
      novelId: req.params.novelId,
      chapterNumber: req.body.chapterNumber,
      targetWords: req.body.targetWords
    });
    res.status(500).json({ message: 'Failed to generate long chapter', error: error.message });
  }
});

// POST /api/chapters/:chapterId/review - Review chapter with AI
router.post('/:chapterId/review', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId)
      .populate({
        path: 'novel',
        populate: {
          path: 'genre',
          model: 'Genre'
        }
      });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const context = {
      chapterNumber: chapter.number,
      genre: chapter.novel.genre,
      premise: chapter.novel.premise
    };

    // Review chapter with AI
    const reviewResult = await aiService.reviewChapter(
      chapter.content.current, 
      context, 
      chapter.novel.settings.customization
    );

    // Update chapter with review
    chapter.review.aiReview = {
      completed: true,
      score: reviewResult.review.scores.overall,
      feedback: JSON.stringify(reviewResult.review),
      suggestions: reviewResult.review.recommendations,
      issuesFound: reviewResult.review.issues
    };

    chapter.review.status = 'completed';
    await chapter.save();

    logger.info('Chapter reviewed', { chapterId: chapter._id });

    res.json({
      review: reviewResult.review,
      metadata: reviewResult.metadata
    });
  } catch (error) {
    logger.error('Error reviewing chapter', { 
      error: error.message, 
      chapterId: req.params.chapterId 
    });
    res.status(500).json({ message: 'Failed to review chapter', error: error.message });
  }
});

// PUT /api/chapters/:chapterId - Update chapter content
router.put('/:chapterId', async (req, res) => {
  try {
    const { content, approved, userNotes } = req.body;

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Store previous version in revision history
    if (content && content !== chapter.content.current) {
      chapter.aiMetadata.revisionHistory.push({
        version: chapter.aiMetadata.revisionHistory.length + 1,
        content: chapter.content.current,
        reason: 'User edit',
        timestamp: new Date()
      });

      chapter.content.edited = content;
      chapter.content.current = content;
    }

    if (approved !== undefined) {
      chapter.review.userReview.approved = approved;
      chapter.review.status = approved ? 'approved' : 'pending';
      
      if (approved) {
        chapter.status = 'approved';
        chapter.timeline.approved = new Date();
      }
    }

    if (userNotes) {
      chapter.review.userReview.notes = userNotes;
    }

    await chapter.save();

    logger.info('Chapter updated', { chapterId: chapter._id });
    res.json(chapter);
  } catch (error) {
    logger.error('Error updating chapter', { 
      error: error.message, 
      chapterId: req.params.chapterId 
    });
    res.status(500).json({ message: 'Failed to update chapter', error: error.message });
  }
});

// POST /api/chapters/:chapterId/regenerate - Regenerate chapter
router.post('/:chapterId/regenerate', async (req, res) => {
  try {
    const { customInstructions } = req.body;

    const chapter = await Chapter.findById(req.params.chapterId)
      .populate({
        path: 'novel',
        populate: [
          { path: 'characters' },
          { path: 'genre', model: 'Genre' }
        ]
      });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Get chapter outline
    const chapterOutline = getChapterOutline(chapter.novel, chapter.number);
    if (!chapterOutline) {
      return res.status(400).json({ message: 'Chapter outline not found' });
    }

    // Get context for generation
    const previousChapters = await Chapter.getContextForGeneration(chapter.novel._id, chapter.number);
    
    const context = {
      genre: chapter.novel.genre,
      premise: chapter.novel.premise,
      characters: chapter.novel.characters,
      previousChapter: previousChapters[0] || null
    };

    // Add custom instructions if provided
    const customization = { 
      ...chapter.novel.settings.customization,
      additionalInstructions: customInstructions 
    };

    // Store current version in revision history
    chapter.aiMetadata.revisionHistory.push({
      version: chapter.aiMetadata.revisionHistory.length + 1,
      content: chapter.content.current,
      reason: 'Regeneration',
      timestamp: new Date()
    });

    // Generate new chapter content
    const result = await aiService.generateChapter(chapterOutline, context, customization);

    // Update chapter
    chapter.content.current = result.content;
    chapter.aiMetadata = { ...chapter.aiMetadata, ...result.metadata };
    chapter.aiMetadata.attempts += 1;
    chapter.status = 'generated';
    chapter.review.status = 'pending';

    await chapter.save();

    logger.info('Chapter regenerated', { chapterId: chapter._id });
    res.json(chapter);
  } catch (error) {
    logger.error('Error regenerating chapter', { 
      error: error.message, 
      chapterId: req.params.chapterId 
    });
    res.status(500).json({ message: 'Failed to regenerate chapter', error: error.message });
  }
});

// DELETE /api/chapters/:chapterId - Delete chapter
router.delete('/:chapterId', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Remove chapter from novel
    await Novel.findByIdAndUpdate(chapter.novel, {
      $pull: { chapters: chapter._id },
      $inc: { 'progress.currentChapter': -1 }
    });

    await Chapter.findByIdAndDelete(req.params.chapterId);

    logger.info('Chapter deleted', { chapterId: req.params.chapterId });
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    logger.error('Error deleting chapter', { 
      error: error.message, 
      chapterId: req.params.chapterId 
    });
    res.status(500).json({ message: 'Failed to delete chapter', error: error.message });
  }
});

// GET /api/chapters/:chapterId/statistics - Get chapter statistics
router.get('/:chapterId/statistics', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Calculate fresh statistics
    const stats = aiService.calculateTextStatistics(chapter.content.current);
    
    res.json({
      stored: chapter.statistics,
      calculated: stats,
      qualityMetrics: chapter.qualityMetrics
    });
  } catch (error) {
    logger.error('Error fetching chapter statistics', { 
      error: error.message, 
      chapterId: req.params.chapterId 
    });
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

function getChapterOutline(novel, chapterNumber) {
  if (!novel.outline?.threeActStructure) return null;

  const { act1, act2, act3 } = novel.outline.threeActStructure;
  const allChapters = [...act1.chapters, ...act2.chapters, ...act3.chapters];
  
  return allChapters.find(ch => ch.number === chapterNumber);
}

module.exports = router;
