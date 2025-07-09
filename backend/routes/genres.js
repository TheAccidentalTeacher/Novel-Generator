const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/genres.log' })
  ]
});

// GET /api/genres - Get all genres
router.get('/', async (req, res) => {
  try {
    const { category, active = true } = req.query;
    const query = { active };
    
    if (category) query.category = category;

    const genres = await Genre.find(query)
      .sort({ priority: -1, name: 1 })
      .select('-promptingStrategies -examples'); // Exclude large fields for list view

    res.json(genres);
  } catch (error) {
    logger.error('Error fetching genres', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch genres', error: error.message });
  }
});

// GET /api/genres/top - Get top priority genres
router.get('/top', async (req, res) => {
  try {
    const topGenres = await Genre.getTopGenres();
    res.json(topGenres);
  } catch (error) {
    logger.error('Error fetching top genres', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch top genres', error: error.message });
  }
});

// GET /api/genres/:id - Get specific genre
router.get('/:id', async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    res.json(genre);
  } catch (error) {
    logger.error('Error fetching genre', { error: error.message, genreId: req.params.id });
    res.status(500).json({ message: 'Failed to fetch genre', error: error.message });
  }
});

// GET /api/genres/:id/prompting-context/:phase - Get prompting context for AI
router.get('/:id/prompting-context/:phase', async (req, res) => {
  try {
    const { phase } = req.params;
    
    if (!['planning', 'drafting', 'reviewing'].includes(phase)) {
      return res.status(400).json({ 
        message: 'Invalid phase. Must be planning, drafting, or reviewing' 
      });
    }

    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    const context = genre.getPromptingContext(phase);
    res.json(context);
  } catch (error) {
    logger.error('Error fetching prompting context', { 
      error: error.message, 
      genreId: req.params.id,
      phase: req.params.phase 
    });
    res.status(500).json({ message: 'Failed to fetch prompting context', error: error.message });
  }
});

// POST /api/genres - Create new genre (admin function)
router.post('/', async (req, res) => {
  try {
    const genreData = req.body;
    
    // Validate required fields
    if (!genreData.name || !genreData.category || !genreData.definition?.description) {
      return res.status(400).json({ 
        message: 'Name, category, and definition description are required' 
      });
    }

    const genre = new Genre(genreData);
    await genre.save();

    logger.info('Genre created', { genreId: genre._id, name: genre.name });
    res.status(201).json(genre);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Genre name already exists' });
    }
    
    logger.error('Error creating genre', { error: error.message });
    res.status(500).json({ message: 'Failed to create genre', error: error.message });
  }
});

// PUT /api/genres/:id - Update genre
router.put('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    logger.info('Genre updated', { genreId: genre._id });
    res.json(genre);
  } catch (error) {
    logger.error('Error updating genre', { error: error.message, genreId: req.params.id });
    res.status(500).json({ message: 'Failed to update genre', error: error.message });
  }
});

// DELETE /api/genres/:id - Delete genre
router.delete('/:id', async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    logger.info('Genre deleted', { genreId: req.params.id });
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    logger.error('Error deleting genre', { error: error.message, genreId: req.params.id });
    res.status(500).json({ message: 'Failed to delete genre', error: error.message });
  }
});

module.exports = router;
