const express = require('express');
const router = express.Router();

// Mock data
const mockNovels = [
  {
    _id: '1',
    title: 'The Last Garden',
    premise: 'A small-town pastor discovers that faith can bloom even in the darkest seasons when a mysterious garden appears overnight in the church cemetery.',
    genre: { primary: 'Christian Fiction', _id: '1' },
    status: 'drafting',
    progress: {
      currentChapter: 3,
      totalChapters: 20,
      percentComplete: 15,
      wordsWritten: 12500
    },
    createdAt: new Date('2024-01-15'),
    targetWordCount: 80000
  },
  {
    _id: '2',
    title: 'Shadows in Millbrook',
    premise: 'When the town librarian finds a decades-old letter hidden in a returned book, she uncovers a web of secrets that someone is willing to kill to keep buried.',
    genre: { primary: 'Cozy Mystery', _id: '3' },
    status: 'completed',
    progress: {
      currentChapter: 18,
      totalChapters: 18,
      percentComplete: 100,
      wordsWritten: 75000
    },
    createdAt: new Date('2023-11-20'),
    targetWordCount: 75000
  }
];

// GET /api/novels - Get all novels
router.get('/', async (req, res) => {
  try {
    const { status, genre, page = 1, limit = 10 } = req.query;
    
    let filteredNovels = [...mockNovels];
    
    if (status) {
      filteredNovels = filteredNovels.filter(novel => novel.status === status);
    }
    
    if (genre) {
      filteredNovels = filteredNovels.filter(novel => novel.genre.primary === genre);
    }
    
    res.json({
      success: true,
      novels: filteredNovels,
      total: filteredNovels.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredNovels.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching novels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch novels',
      error: error.message
    });
  }
});

// GET /api/novels/:id - Get a specific novel
router.get('/:id', async (req, res) => {
  try {
    const novel = mockNovels.find(n => n._id === req.params.id);
    
    if (!novel) {
      return res.status(404).json({
        success: false,
        message: 'Novel not found'
      });
    }
    
    res.json({
      success: true,
      data: novel
    });
  } catch (error) {
    console.error('Error fetching novel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch novel',
      error: error.message
    });
  }
});

// POST /api/novels - Create a new novel
router.post('/', async (req, res) => {
  try {
    const newNovel = {
      _id: String(mockNovels.length + 1),
      ...req.body,
      status: 'planning',
      progress: {
        currentChapter: 0,
        totalChapters: req.body.chapters || 20,
        percentComplete: 0,
        wordsWritten: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockNovels.push(newNovel);
    
    res.status(201).json({
      success: true,
      data: newNovel,
      message: 'Novel created successfully'
    });
  } catch (error) {
    console.error('Error creating novel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create novel',
      error: error.message
    });
  }
});

module.exports = router;
