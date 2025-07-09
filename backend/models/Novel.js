const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  premise: {
    type: String,
    required: true,
    maxlength: 2000
  },
  genre: {
    primary: {
      type: String,
      required: true,
      enum: [
        'Christian Fiction',
        'Mystery',
        'Cozy Mystery',
        'Romance',
        'Christian Romance',
        'Thriller',
        'Suspense',
        'Christian Suspense',
        'Historical Fiction',
        'Christian Historical Fiction',
        'Contemporary Fiction',
        'Christian Contemporary Fiction',
        'Speculative Fiction',
        'Christian Speculative Fiction',
        'Fantasy',
        'Science Fiction',
        'Young Adult',
        'Literary Fiction',
        'Women\'s Fiction',
        'Adventure',
        'Western',
        'Horror',
        'Crime',
        'Drama'
      ]
    },
    subGenres: [{
      type: String,
      trim: true
    }]
  },
  outline: {
    summary: String,
    threeActStructure: {
      act1: {
        description: String,
        chapters: [{
          number: Number,
          title: String,
          summary: String,
          objectives: [String],
          wordCountTarget: {
            type: Number,
            default: 2000
          }
        }]
      },
      act2: {
        description: String,
        chapters: [{
          number: Number,
          title: String,
          summary: String,
          objectives: [String],
          wordCountTarget: {
            type: Number,
            default: 2000
          }
        }]
      },
      act3: {
        description: String,
        chapters: [{
          number: Number,
          title: String,
          summary: String,
          objectives: [String],
          wordCountTarget: {
            type: Number,
            default: 2000
          }
        }]
      }
    },
    plotPoints: [{
      name: String,
      description: String,
      chapter: Number,
      importance: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }],
    themes: [{
      primary: String,
      secondary: [String],
      symbols: [String],
      motifs: [String]
    }],
    timeline: [{
      event: String,
      chapter: Number,
      timeframe: String,
      importance: String
    }]
  },
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  settings: {
    wordCountTarget: {
      total: {
        type: Number,
        default: 60000
      },
      perChapter: {
        min: {
          type: Number,
          default: 1750
        },
        max: {
          type: Number,
          default: 2250
        }
      }
    },
    customization: {
      writingStyle: {
        showDontTellEmphasis: {
          type: Number,
          min: 1,
          max: 10,
          default: 8
        },
        descriptiveDensity: {
          type: Number,
          min: 1,
          max: 10,
          default: 6
        },
        dialogueFrequency: {
          type: Number,
          min: 1,
          max: 10,
          default: 7
        },
        pacingProfile: {
          type: String,
          enum: ['slow-burn', 'moderate', 'fast-paced'],
          default: 'moderate'
        }
      },
      characterDevelopment: {
        depth: {
          type: String,
          enum: ['minimal', 'moderate', 'extensive'],
          default: 'moderate'
        },
        arcComplexity: {
          type: String,
          enum: ['simple', 'moderate', 'complex'],
          default: 'moderate'
        }
      },
      thematicElements: {
        primaryEmphasis: {
          type: Number,
          min: 1,
          max: 10,
          default: 7
        },
        faithIntegration: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        }
      }
    },
    additionalInstructions: String
  },
  status: {
    type: String,
    enum: ['planning', 'outlining', 'drafting', 'reviewing', 'completed', 'paused'],
    default: 'planning'
  },
  workflow: {
    type: String,
    enum: ['one-click', 'chapter-by-chapter', 'hybrid'],
    default: 'chapter-by-chapter'
  },
  progress: {
    currentChapter: {
      type: Number,
      default: 0
    },
    totalChapters: {
      type: Number,
      default: 0
    },
    wordsWritten: {
      type: Number,
      default: 0
    },
    percentComplete: {
      type: Number,
      default: 0
    }
  },
  aiMetadata: {
    modelVersions: {
      planning: String,
      drafting: String,
      reviewing: String
    },
    generationSettings: {
      temperature: {
        type: Number,
        default: 0.7
      },
      maxTokens: {
        type: Number,
        default: 4096
      }
    },
    qualityScores: {
      coherence: Number,
      consistency: Number,
      engagement: Number,
      overall: Number
    }
  },
  cover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cover'
  }
}, {
  timestamps: true
});

// Indexes for performance
novelSchema.index({ 'genre.primary': 1 });
novelSchema.index({ status: 1 });
novelSchema.index({ createdAt: -1 });
novelSchema.index({ title: 'text', premise: 'text' });

// Virtual for completion percentage
novelSchema.virtual('completionPercentage').get(function() {
  if (this.progress.totalChapters === 0) return 0;
  return Math.round((this.progress.currentChapter / this.progress.totalChapters) * 100);
});

// Pre-save middleware to update progress
novelSchema.pre('save', function(next) {
  if (this.progress.totalChapters > 0) {
    this.progress.percentComplete = Math.round((this.progress.currentChapter / this.progress.totalChapters) * 100);
  }
  next();
});

module.exports = mongoose.model('Novel', novelSchema);
