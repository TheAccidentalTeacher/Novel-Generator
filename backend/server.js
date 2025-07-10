const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

// Import routes
const novelRoutes = require('./routes/novels.mock');
const chapterRoutes = require('./routes/chapters');
const genreRoutes = require('./routes/genres.mock');
const aiRoutes = require('./routes/ai');
const coverRoutes = require('./routes/covers');

const app = express();
const PORT = process.env.PORT || 5000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'novelforge-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelforge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch((error) => logger.error('MongoDB connection error:', error));

// Middleware
app.set('trust proxy', true); // Trust Railway proxy headers
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - disabled for Railway deployment issues
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true, // Return rate limit info in headers
//   legacyHeaders: false, // Disable legacy X-RateLimit-* headers
//   trustProxy: true, // Trust Railway proxy headers
// });
// app.use(limiter);

// Stricter rate limiting for AI endpoints - disabled for Railway deployment issues
// const aiLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 50, // limit each IP to 50 AI requests per hour
//   message: 'AI request limit exceeded, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   trustProxy: true, // Trust Railway proxy headers
// });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/ai', aiRoutes); // Temporarily disable AI rate limiting
app.use('/api/covers', coverRoutes);

// Mock data for development (when MongoDB is not available)
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
  },
  {
    _id: '4',
    name: 'Romance',
    description: 'Love stories with emotional journeys and happy endings',
    characteristics: ['Romantic tension', 'Character growth', 'Happy ending'],
    conventions: {
      themes: ['Love', 'Trust', 'Commitment'],
      characterTypes: ['Love interest', 'Protagonist', 'Rival'],
      commonPlots: ['Enemies to lovers', 'Second chance', 'Forbidden love']
    }
  },
  {
    _id: '5',
    name: 'Fantasy',
    description: 'Magical worlds with supernatural elements and adventure',
    characteristics: ['Magic systems', 'World-building', 'Quest narratives'],
    conventions: {
      themes: ['Good vs Evil', 'Power', 'Destiny'],
      characterTypes: ['Hero', 'Mentor', 'Dark Lord'],
      commonPlots: ['Chosen one', 'Quest', 'Coming of age']
    }
  },
  {
    _id: '6',
    name: 'Science Fiction',
    description: 'Futuristic stories exploring technology and its impact',
    characteristics: ['Advanced technology', 'Future settings', 'Scientific concepts'],
    conventions: {
      themes: ['Progress', 'Identity', 'Survival'],
      characterTypes: ['Scientist', 'Explorer', 'AI'],
      commonPlots: ['First contact', 'Dystopian future', 'Space exploration']
    }
  },
  {
    _id: '7',
    name: 'Historical Fiction',
    description: 'Stories set in the past with authentic historical details',
    characteristics: ['Historical accuracy', 'Period atmosphere', 'Cultural context'],
    conventions: {
      themes: ['Change', 'Tradition', 'Identity'],
      characterTypes: ['Historical figure', 'Commoner', 'Aristocrat'],
      commonPlots: ['War story', 'Social change', 'Personal journey']
    }
  },
  {
    _id: '8',
    name: 'Thriller',
    description: 'Fast-paced stories with constant tension and suspense',
    characteristics: ['High stakes', 'Constant danger', 'Quick pacing'],
    conventions: {
      themes: ['Survival', 'Betrayal', 'Justice'],
      characterTypes: ['Protagonist', 'Antagonist', 'Victim'],
      commonPlots: ['Chase', 'Conspiracy', 'Rescue mission']
    }
  },
  {
    _id: '9',
    name: 'Horror',
    description: 'Dark stories designed to frighten and create suspense',
    characteristics: ['Fear', 'Supernatural elements', 'Psychological tension'],
    conventions: {
      themes: ['Good vs Evil', 'Survival', 'Madness'],
      characterTypes: ['Final girl', 'Monster', 'Innocent'],
      commonPlots: ['Haunted house', 'Monster attack', 'Psychological breakdown']
    }
  },
  {
    _id: '10',
    name: 'Literary Fiction',
    description: 'Character-driven stories with artistic and thematic depth',
    characteristics: ['Character development', 'Stylistic prose', 'Thematic complexity'],
    conventions: {
      themes: ['Human condition', 'Relationships', 'Society'],
      characterTypes: ['Complex protagonist', 'Ensemble cast', 'Unreliable narrator'],
      commonPlots: ['Coming of age', 'Family saga', 'Social commentary']
    }
  },
  {
    _id: '11',
    name: 'Young Adult',
    description: 'Stories for teenage readers with young protagonists',
    characteristics: ['Teen protagonists', 'Coming of age', 'Identity themes'],
    conventions: {
      themes: ['Identity', 'Friendship', 'First love'],
      characterTypes: ['Teen hero', 'Best friend', 'Love interest'],
      commonPlots: ['High school drama', 'Dystopian adventure', 'Supernatural romance']
    }
  },
  {
    _id: '12',
    name: 'Adventure',
    description: 'Action-packed stories with exciting journeys and quests',
    characteristics: ['Physical challenges', 'Exotic locations', 'Fast pacing'],
    conventions: {
      themes: ['Courage', 'Discovery', 'Survival'],
      characterTypes: ['Adventurer', 'Guide', 'Antagonist'],
      commonPlots: ['Treasure hunt', 'Survival story', 'Exploration']
    }
  },
  {
    _id: '13',
    name: 'Western',
    description: 'Stories set in the American frontier with cowboys and outlaws',
    characteristics: ['Frontier setting', 'Moral codes', 'Gunfights'],
    conventions: {
      themes: ['Justice', 'Freedom', 'Civilization vs Wild'],
      characterTypes: ['Gunslinger', 'Sheriff', 'Outlaw'],
      commonPlots: ['Showdown', 'Cattle drive', 'Town taming']
    }
  },
  {
    _id: '14',
    name: 'Contemporary Fiction',
    description: 'Modern stories reflecting current life and social issues',
    characteristics: ['Current settings', 'Realistic characters', 'Social relevance'],
    conventions: {
      themes: ['Modern life', 'Relationships', 'Social issues'],
      characterTypes: ['Everyday people', 'Professionals', 'Families'],
      commonPlots: ['Life changes', 'Relationship drama', 'Career challenges']
    }
  },
  {
    _id: '15',
    name: 'Dystopian',
    description: 'Dark futures with oppressive societies and rebellion',
    characteristics: ['Oppressive government', 'Rebellion', 'Social control'],
    conventions: {
      themes: ['Freedom', 'Resistance', 'Power'],
      characterTypes: ['Rebel', 'Oppressor', 'Citizen'],
      commonPlots: ['Uprising', 'Escape', 'Revolution']
    }
  },
  {
    _id: '16',
    name: 'Urban Fantasy',
    description: 'Fantasy elements in modern urban settings',
    characteristics: ['Modern city setting', 'Hidden magic', 'Supernatural beings'],
    conventions: {
      themes: ['Hidden world', 'Power', 'Identity'],
      characterTypes: ['Urban witch', 'Supernatural detective', 'Mythical creature'],
      commonPlots: ['Supernatural mystery', 'Magical awakening', 'Urban legend']
    }
  },
  {
    _id: '17',
    name: 'Paranormal Romance',
    description: 'Romance with supernatural elements and otherworldly beings',
    characteristics: ['Supernatural love interests', 'Paranormal elements', 'Romantic tension'],
    conventions: {
      themes: ['Forbidden love', 'Supernatural bonds', 'Destiny'],
      characterTypes: ['Vampire', 'Werewolf', 'Psychic'],
      commonPlots: ['Supernatural mate', 'Forbidden romance', 'Supernatural triangle']
    }
  },
  {
    _id: '18',
    name: 'Space Opera',
    description: 'Epic science fiction with galactic scope and adventure',
    characteristics: ['Galactic scale', 'Advanced civilizations', 'Epic conflicts'],
    conventions: {
      themes: ['Empire', 'Rebellion', 'Destiny'],
      characterTypes: ['Space captain', 'Alien ruler', 'Rebel leader'],
      commonPlots: ['Galactic war', 'Space exploration', 'Alien encounter']
    }
  },
  {
    _id: '19',
    name: 'Cyberpunk',
    description: 'High-tech, low-life futures with corporate dystopias',
    characteristics: ['Cybernetic enhancement', 'Corporate control', 'Information warfare'],
    conventions: {
      themes: ['Technology vs humanity', 'Corporate power', 'Identity'],
      characterTypes: ['Hacker', 'Corporate executive', 'Cyborg'],
      commonPlots: ['Data heist', 'Corporate conspiracy', 'Virtual reality']
    }
  },
  {
    _id: '20',
    name: 'Magical Realism',
    description: 'Realistic stories with subtle magical or fantastical elements',
    characteristics: ['Subtle magic', 'Realistic settings', 'Symbolic elements'],
    conventions: {
      themes: ['Reality vs fantasy', 'Cultural identity', 'Memory'],
      characterTypes: ['Ordinary person', 'Wise elder', 'Mysterious figure'],
      commonPlots: ['Mysterious events', 'Cultural journey', 'Family secrets']
    }
  }
];

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

// Mock endpoints when MongoDB is not available
app.get('/api/genres', (req, res) => {
  res.json({ success: true, data: mockGenres });
});

app.get('/api/novels', (req, res) => {
  res.json({ success: true, novels: mockNovels, total: mockNovels.length });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NovelForge backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error(error.stack);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`NovelForge backend server running on port ${PORT}`);
});

module.exports = app;
