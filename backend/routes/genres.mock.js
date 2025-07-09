const express = require('express');
const router = express.Router();

// Mock data
const mockGenres = [
  {
    _id: '1',
    name: 'Christian Fiction',
    description: 'Faith-based stories with Christian themes and values',
    characteristics: ['Faith journey', 'Moral lessons', 'Hope and redemption'],
    conventions: {
      themes: ['Faith', 'Redemption', 'Community'],
      characterTypes: ['Believer', 'Seeker', 'Pastor'],
      commonPlots: ['Spiritual awakening', 'Testing of faith', 'Community healing']
    }
  },
  {
    _id: '2',
    name: 'Mystery',
    description: 'Crime-solving stories with suspense and investigation',
    characteristics: ['Puzzle solving', 'Red herrings', 'Detective work'],
    conventions: {
      themes: ['Justice', 'Truth', 'Deception'],
      characterTypes: ['Detective', 'Suspect', 'Victim'],
      commonPlots: ['Murder investigation', 'Missing person', 'Cold case']
    }
  },
  {
    _id: '3',
    name: 'Cozy Mystery',
    description: 'Gentle mysteries with amateur sleuths in small communities',
    characteristics: ['Amateur detective', 'Small town setting', 'Light tone'],
    conventions: {
      themes: ['Community', 'Justice', 'Friendship'],
      characterTypes: ['Amateur sleuth', 'Townspeople', 'Local authority'],
      commonPlots: ['Local crime', 'Small town secrets', 'Community disruption']
    }
  }
];

// GET /api/genres - Get all genres
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockGenres,
      total: mockGenres.length
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genres',
      error: error.message
    });
  }
});

module.exports = router;
