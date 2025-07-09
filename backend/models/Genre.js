const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Christian Fiction', 'Mystery', 'Romance', 'Thriller', 'Historical', 'Contemporary', 'Speculative', 'Other'],
    required: true
  },
  subGenres: [String],
  definition: {
    description: {
      type: String,
      required: true
    },
    targetAudience: String,
    readerExpectations: [String],
    keyCharacteristics: [String]
  },
  structure: {
    commonNarrativeStructures: [String],
    typicalPlotArcs: [String],
    pacingGuidelines: String,
    chapterStructure: String,
    wordCountGuidelines: {
      novel: {
        min: Number,
        max: Number,
        target: Number
      },
      chapter: {
        min: Number,
        max: Number,
        target: Number
      }
    }
  },
  characters: {
    archetypes: [{
      name: String,
      description: String,
      commonTraits: [String],
      typicalRole: String,
      developmentPatterns: [String]
    }],
    relationships: {
      commonDynamics: [String],
      conflictPatterns: [String],
      resolutionApproaches: [String]
    },
    developmentGuidelines: [String]
  },
  settings: {
    commonEnvironments: [String],
    timeperiods: [String],
    atmosphereGuidelines: [String],
    worldBuildingRequirements: [String]
  },
  style: {
    languagePatterns: [String],
    toneGuidelines: [String],
    voiceCharacteristics: [String],
    punctuationPreferences: [String],
    sentenceStructure: [String],
    paragraphGuidelines: [String]
  },
  content: {
    thematicElements: [String],
    commonThemes: [String],
    appropriateTopics: [String],
    contentRestrictions: [String],
    sensitivities: [String],
    moralFramework: String
  },
  tropes: {
    beneficial: [{
      name: String,
      description: String,
      usage: String
    }],
    overused: [{
      name: String,
      description: String,
      alternative: String
    }],
    forbidden: [{
      name: String,
      reason: String
    }]
  },
  marketAnalysis: {
    bestsellers: [String],
    currentTrends: [String],
    readerPreferences: [String],
    publishingConsiderations: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  promptingStrategies: {
    planning: {
      premiseGeneration: String,
      outlineCreation: String,
      characterDevelopment: String,
      themeIntegration: String
    },
    drafting: {
      chapterGeneration: String,
      dialogueGuidance: String,
      sceneConstruction: String,
      pacingInstructions: String
    },
    reviewing: {
      qualityChecks: [String],
      consistencyVerification: [String],
      genreCompliance: [String]
    }
  },
  christianSpecific: {
    // Only populated for Christian fiction genres
    theologyGuidelines: [String],
    scriptureIntegration: {
      frequency: String,
      methods: [String],
      contexts: [String]
    },
    faithElements: {
      prayer: String,
      worship: String,
      fellowship: String,
      witnessing: String,
      discipleship: String
    },
    contentStandards: {
      language: String,
      violence: String,
      sexuality: String,
      substances: String,
      themes: [String]
    },
    spiritualArc: {
      commonJourneys: [String],
      growthPatterns: [String],
      challengeTypes: [String],
      resolutionApproaches: [String]
    }
  },
  examples: {
    premises: [String],
    openingLines: [String],
    sceneExamples: [String],
    dialogueSamples: [String],
    endingStyles: [String]
  },
  priority: {
    type: Number,
    default: 0 // Higher numbers appear first in lists
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
genreSchema.index({ name: 1 });
genreSchema.index({ category: 1 });
genreSchema.index({ priority: -1, name: 1 });
genreSchema.index({ active: 1 });

// Method to get prompting context for AI generation
genreSchema.methods.getPromptingContext = function(phase = 'drafting') {
  const context = {
    genre: this.name,
    definition: this.definition.description,
    keyCharacteristics: this.definition.keyCharacteristics,
    style: this.style,
    content: this.content,
    structure: this.structure
  };

  if (this.promptingStrategies[phase]) {
    context.specificGuidance = this.promptingStrategies[phase];
  }

  if (this.christianSpecific && Object.keys(this.christianSpecific).length > 0) {
    context.christianElements = this.christianSpecific;
  }

  return context;
};

// Static method to get top priority genres for UI
genreSchema.statics.getTopGenres = function() {
  return this.find({ active: true })
    .sort({ priority: -1, name: 1 })
    .limit(10);
};

module.exports = mongoose.model('Genre', genreSchema);
