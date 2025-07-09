const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Character = require('../models/Character');
const Cover = require('../models/Cover');
const aiService = require('../services/aiService');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/novels.log' })
  ]
});

// GET /api/novels - Get all novels
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, genre } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (genre) query['genre.primary'] = genre;

    const novels = await Novel.find(query)
      .populate('characters', 'name role')
      .populate('cover', 'images.final')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Novel.countDocuments(query);

    res.json({
      novels,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Error fetching novels', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch novels', error: error.message });
  }
});

// GET /api/novels/:id - Get specific novel
router.get('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id)
      .populate('characters')
      .populate('chapters')
      .populate('cover');

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    res.json(novel);
  } catch (error) {
    logger.error('Error fetching novel', { error: error.message, novelId: req.params.id });
    res.status(500).json({ message: 'Failed to fetch novel', error: error.message });
  }
});

// POST /api/novels - Create new novel
router.post('/', async (req, res) => {
  try {
    const novelData = req.body;
    
    // Validate required fields
    if (!novelData.title || !novelData.genre?.primary) {
      return res.status(400).json({ 
        message: 'Title and primary genre are required' 
      });
    }

    const novel = new Novel(novelData);
    await novel.save();

    logger.info('Novel created', { novelId: novel._id, title: novel.title });
    res.status(201).json(novel);
  } catch (error) {
    logger.error('Error creating novel', { error: error.message });
    res.status(500).json({ message: 'Failed to create novel', error: error.message });
  }
});

// PUT /api/novels/:id - Update novel
router.put('/:id', async (req, res) => {
  try {
    const novel = await Novel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    logger.info('Novel updated', { novelId: novel._id });
    res.json(novel);
  } catch (error) {
    logger.error('Error updating novel', { error: error.message, novelId: req.params.id });
    res.status(500).json({ message: 'Failed to update novel', error: error.message });
  }
});

// DELETE /api/novels/:id - Delete novel
router.delete('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    // Delete associated data
    await Chapter.deleteMany({ novel: req.params.id });
    await Character.deleteMany({ novel: req.params.id });
    await Cover.deleteMany({ novel: req.params.id });
    await Novel.findByIdAndDelete(req.params.id);

    logger.info('Novel deleted', { novelId: req.params.id });
    res.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    logger.error('Error deleting novel', { error: error.message, novelId: req.params.id });
    res.status(500).json({ message: 'Failed to delete novel', error: error.message });
  }
});

// POST /api/novels/:id/generate-complete - One-click complete novel generation
router.post('/:id/generate-complete', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    if (novel.status !== 'planning') {
      return res.status(400).json({ 
        message: 'Novel must be in planning status for complete generation' 
      });
    }

    // Set status to indicate generation in progress
    novel.status = 'generating';
    await novel.save();

    // Start background generation process
    generateCompleteNovel(novel._id);

    res.json({ 
      message: 'Complete novel generation started',
      novelId: novel._id,
      status: 'generating'
    });
  } catch (error) {
    logger.error('Error starting complete novel generation', { 
      error: error.message, 
      novelId: req.params.id 
    });
    res.status(500).json({ message: 'Failed to start generation', error: error.message });
  }
});

// GET /api/novels/:id/progress - Get generation progress
router.get('/:id/progress', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' });
    }

    const chapters = await Chapter.find({ novel: req.params.id })
      .select('number status statistics.wordCount');

    res.json({
      status: novel.status,
      progress: novel.progress,
      chapters: chapters.map(ch => ({
        number: ch.number,
        status: ch.status,
        wordCount: ch.statistics.wordCount
      }))
    });
  } catch (error) {
    logger.error('Error fetching progress', { error: error.message, novelId: req.params.id });
    res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
  }
});

// Background generation function
async function generateCompleteNovel(novelId) {
  try {
    const novel = await Novel.findById(novelId)
      .populate('characters')
      .populate({
        path: 'genre',
        model: 'Genre'
      });

    logger.info('Starting complete novel generation', { novelId });

    // Generate outline if not exists
    if (!novel.outline || !novel.outline.threeActStructure) {
      // Implementation would call AI service to generate outline
      logger.info('Generating outline', { novelId });
      // await generateOutlineForNovel(novel);
    }

    // Generate all chapters
    const totalChapters = novel.outline?.threeActStructure ? 
      (novel.outline.threeActStructure.act1.chapters.length +
       novel.outline.threeActStructure.act2.chapters.length +
       novel.outline.threeActStructure.act3.chapters.length) : 20;

    novel.progress.totalChapters = totalChapters;
    await novel.save();

    for (let i = 1; i <= totalChapters; i++) {
      try {
        await generateChapterForNovel(novel, i);
        novel.progress.currentChapter = i;
        novel.progress.percentComplete = Math.round((i / totalChapters) * 100);
        await novel.save();
        
        logger.info('Chapter generated', { novelId, chapterNumber: i });
      } catch (chapterError) {
        logger.error('Chapter generation failed', { 
          novelId, 
          chapterNumber: i, 
          error: chapterError.message 
        });
        // Continue with next chapter
      }
    }

    novel.status = 'completed';
    await novel.save();
    
    logger.info('Complete novel generation finished', { novelId });

  } catch (error) {
    logger.error('Complete novel generation failed', { novelId, error: error.message });
    
    // Update novel status to indicate failure
    await Novel.findByIdAndUpdate(novelId, { status: 'paused' });
  }
}

async function generateChapterForNovel(novel, chapterNumber) {
  // Get chapter outline
  const chapterOutline = getChapterOutline(novel, chapterNumber);
  if (!chapterOutline) {
    throw new Error(`Chapter ${chapterNumber} outline not found`);
  }

  // Get context for generation
  const previousChapters = await Chapter.getContextForGeneration(novel._id, chapterNumber);
  
  const context = {
    genre: novel.genre,
    premise: novel.premise,
    characters: novel.characters,
    previousChapter: previousChapters[0] || null
  };

  // Generate chapter content
  const result = await aiService.generateChapter(chapterOutline, context, novel.settings.customization);

  // Create chapter document
  const chapter = new Chapter({
    novel: novel._id,
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
  novel.chapters.push(chapter._id);
  await novel.save();

  return chapter;
}

function getChapterOutline(novel, chapterNumber) {
  if (!novel.outline?.threeActStructure) return null;

  const { act1, act2, act3 } = novel.outline.threeActStructure;
  const allChapters = [...act1.chapters, ...act2.chapters, ...act3.chapters];
  
  return allChapters.find(ch => ch.number === chapterNumber);
}

module.exports = router;
