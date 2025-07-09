const mongoose = require('mongoose');

const coverSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  design: {
    approach: {
      type: String,
      enum: ['template-based', 'custom-prompt', 'automated-extraction'],
      required: true
    },
    template: {
      id: String,
      name: String,
      category: String,
      customizations: mongoose.Schema.Types.Mixed
    },
    prompt: {
      original: String,
      enhanced: String,
      negativePrompts: [String],
      style: String,
      mood: String,
      elements: [String]
    },
    extractedElements: [{
      type: {
        type: String,
        enum: ['character', 'setting', 'object', 'scene', 'symbol']
      },
      description: String,
      relevance: Number,
      used: Boolean
    }]
  },
  images: {
    base: {
      url: String,
      dallePrompt: String,
      dalleSettings: {
        model: String,
        size: String,
        quality: String,
        style: String
      },
      generatedAt: Date
    },
    variations: [{
      version: Number,
      url: String,
      modifications: String,
      prompt: String,
      generatedAt: Date
    }],
    final: {
      url: String,
      downloadUrl: String,
      processedAt: Date
    }
  },
  typography: {
    title: {
      font: String,
      size: Number,
      color: String,
      position: {
        x: Number,
        y: Number
      },
      effects: [String],
      alignment: String
    },
    author: {
      font: String,
      size: Number,
      color: String,
      position: {
        x: Number,
        y: Number
      },
      effects: [String],
      alignment: String
    },
    subtitle: {
      font: String,
      size: Number,
      color: String,
      position: {
        x: Number,
        y: Number
      },
      effects: [String],
      alignment: String
    }
  },
  layout: {
    composition: String,
    colorPalette: [String],
    dominantColor: String,
    contrast: Number,
    balance: String,
    focal: String
  },
  formats: [{
    platform: {
      type: String,
      enum: ['kindle', 'print', 'ingram-spark', 'draft2digital', 'general'],
      required: true
    },
    dimensions: {
      width: Number,
      height: Number,
      unit: String,
      dpi: Number
    },
    spine: {
      width: Number,
      text: String,
      orientation: String
    },
    backCover: {
      copy: String,
      authorBio: String,
      isbn: String,
      barcode: Boolean
    },
    files: [{
      type: {
        type: String,
        enum: ['front-cover', 'back-cover', 'spine', 'full-wrap', 'ebook']
      },
      url: String,
      filename: String,
      filesize: Number,
      format: String,
      createdAt: Date
    }]
  }],
  analysis: {
    genreAppropriate: {
      score: Number,
      feedback: String,
      suggestions: [String]
    },
    marketAppeal: {
      score: Number,
      comparisons: [String],
      strengths: [String],
      improvements: [String]
    },
    technicalQuality: {
      resolution: Number,
      colorSpace: String,
      printReady: Boolean,
      issues: [String]
    },
    thumbnailEffectiveness: {
      score: Number,
      visibility: String,
      readability: String
    }
  },
  revisions: [{
    version: Number,
    changes: String,
    reason: String,
    images: {
      before: String,
      after: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  approval: {
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'rejected'],
      default: 'draft'
    },
    feedback: String,
    approvedAt: Date,
    rejectedReason: String
  },
  metadata: {
    totalGenerationTime: Number,
    dalleApiCalls: Number,
    tokensUsed: Number,
    costEstimate: Number,
    iterations: Number
  }
}, {
  timestamps: true
});

// Indexes for performance
coverSchema.index({ novel: 1 });
coverSchema.index({ 'approval.status': 1 });
coverSchema.index({ createdAt: -1 });

// Method to get format-specific files
coverSchema.methods.getFormatFiles = function(platform) {
  const format = this.formats.find(f => f.platform === platform);
  return format ? format.files : [];
};

// Method to calculate total cost
coverSchema.methods.calculateCost = function() {
  // Base DALL-E cost calculation
  const baseImageCost = 0.040; // $0.040 per image for DALL-E 3 standard
  const variationCost = 0.020; // $0.020 per variation
  
  let totalCost = baseImageCost; // Base image
  totalCost += (this.images.variations.length * variationCost);
  
  this.metadata.costEstimate = totalCost;
  return totalCost;
};

// Pre-save middleware to update metadata
coverSchema.pre('save', function(next) {
  if (this.isModified('images') || this.isModified('metadata.dalleApiCalls')) {
    this.calculateCost();
  }
  next();
});

module.exports = mongoose.model('Cover', coverSchema);
