const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  number: {
    type: Number,
    required: true,
    min: 1
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    original: {
      type: String,
      required: true
    },
    edited: {
      type: String
    },
    current: {
      type: String,
      required: true
    }
  },
  outline: {
    summary: String,
    objectives: [String],
    plotPoints: [String],
    characterDevelopment: [{
      character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character'
      },
      development: String,
      arc: String
    }],
    thematicElements: [String],
    sceneStructure: [{
      sceneNumber: Number,
      setting: String,
      purpose: String,
      characters: [String],
      conflict: String,
      resolution: String
    }]
  },
  statistics: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    paragraphCount: {
      type: Number,
      default: 0
    },
    sentenceCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 0
    }
  },
  qualityMetrics: {
    repetitionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    diversityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    coherenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    punctuationCompliance: {
      emDashCount: {
        type: Number,
        default: 0
      },
      enDashCount: {
        type: Number,
        default: 0
      },
      complianceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      }
    }
  },
  aiMetadata: {
    generationPrompt: String,
    modelUsed: String,
    temperature: Number,
    maxTokens: Number,
    tokensUsed: Number,
    generationTime: Number,
    attempts: {
      type: Number,
      default: 1
    },
    revisionHistory: [{
      version: Number,
      content: String,
      reason: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  review: {
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    },
    aiReview: {
      completed: {
        type: Boolean,
        default: false
      },
      score: Number,
      feedback: String,
      suggestions: [String],
      issuesFound: [{
        type: {
          type: String,
          enum: ['repetition', 'punctuation', 'consistency', 'pacing', 'character', 'plot']
        },
        description: String,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high']
        },
        suggestion: String
      }]
    },
    userReview: {
      approved: {
        type: Boolean,
        default: false
      },
      notes: String,
      requestedChanges: [String]
    }
  },
  status: {
    type: String,
    enum: ['planning', 'generating', 'generated', 'reviewing', 'revising', 'approved', 'published'],
    default: 'planning'
  },
  timeline: {
    planned: Date,
    generationStarted: Date,
    generationCompleted: Date,
    reviewStarted: Date,
    reviewCompleted: Date,
    approved: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
chapterSchema.index({ novel: 1, number: 1 }, { unique: true });
chapterSchema.index({ novel: 1 });
chapterSchema.index({ status: 1 });
chapterSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate statistics
chapterSchema.pre('save', function(next) {
  if (this.isModified('content.current')) {
    const content = this.content.current;
    
    // Calculate basic statistics
    this.statistics.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    this.statistics.characterCount = content.length;
    this.statistics.paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    this.statistics.sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    this.statistics.readingTime = Math.ceil(this.statistics.wordCount / 200); // 200 words per minute
    
    // Calculate punctuation compliance
    const emDashes = (content.match(/—/g) || []).length;
    const enDashes = (content.match(/–/g) || []).length;
    
    this.qualityMetrics.punctuationCompliance.emDashCount = emDashes;
    this.qualityMetrics.punctuationCompliance.enDashCount = enDashes;
    this.qualityMetrics.punctuationCompliance.complianceScore = emDashes <= 1 ? 100 : Math.max(0, 100 - ((emDashes - 1) * 20));
  }
  next();
});

// Method to calculate repetition score
chapterSchema.methods.calculateRepetitionScore = function() {
  const content = this.content.current.toLowerCase();
  const words = content.split(/\s+/).filter(word => word.length > 2);
  const wordFreq = {};
  
  // Count word frequency
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Calculate repetition score (higher = less repetitive)
  const uniqueWords = Object.keys(wordFreq).length;
  const totalWords = words.length;
  const diversityRatio = uniqueWords / totalWords;
  
  this.qualityMetrics.repetitionScore = Math.round(diversityRatio * 100);
  return this.qualityMetrics.repetitionScore;
};

// Method to get context for next chapter generation
chapterSchema.statics.getContextForGeneration = async function(novelId, chapterNumber) {
  const previousChapters = await this.find({
    novel: novelId,
    number: { $lt: chapterNumber },
    status: { $in: ['approved', 'published'] }
  })
  .sort({ number: -1 })
  .limit(3)
  .select('content.current statistics.wordCount outline');
  
  return previousChapters;
};

module.exports = mongoose.model('Chapter', chapterSchema);
