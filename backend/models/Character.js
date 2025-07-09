const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true
  },
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last: {
      type: String,
      trim: true
    },
    nickname: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    }
  },
  role: {
    type: String,
    enum: ['protagonist', 'antagonist', 'supporting', 'minor'],
    required: true
  },
  demographics: {
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'other']
    },
    ethnicity: String,
    nationality: String,
    occupation: String,
    socialClass: {
      type: String,
      enum: ['lower', 'working', 'middle', 'upper-middle', 'upper']
    }
  },
  physical: {
    height: String,
    build: String,
    hairColor: String,
    eyeColor: String,
    distinguishingFeatures: [String],
    overallDescription: String
  },
  personality: {
    traits: [String],
    strengths: [String],
    weaknesses: [String],
    fears: [String],
    desires: [String],
    motivations: [String],
    values: [String],
    beliefs: [String],
    mbtiType: String,
    enneagramType: String
  },
  background: {
    birthplace: String,
    family: {
      parents: String,
      siblings: String,
      spouse: String,
      children: String,
      other: String
    },
    education: String,
    career: String,
    significantEvents: [String],
    secrets: [String],
    traumas: [String]
  },
  relationships: [{
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    relationshipType: {
      type: String,
      enum: ['family', 'friend', 'romantic', 'professional', 'enemy', 'rival', 'mentor', 'student', 'other']
    },
    description: String,
    dynamics: String,
    status: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'complicated']
    }
  }],
  characterArc: {
    startingPoint: {
      emotionalState: String,
      situation: String,
      beliefs: String,
      goals: String
    },
    incitingIncident: String,
    obstacles: [String],
    growthMoments: [{
      chapter: Number,
      moment: String,
      realization: String,
      change: String
    }],
    climax: {
      chapter: Number,
      challenge: String,
      choice: String,
      action: String
    },
    resolution: {
      newState: String,
      lessonsLearned: String,
      futureDirection: String
    }
  },
  faithJourney: {
    // Specific to Christian fiction characters
    spiritualState: {
      type: String,
      enum: ['non-believer', 'seeker', 'new-believer', 'mature-believer', 'struggling-believer', 'backslider']
    },
    denominationalBackground: String,
    currentChallenges: [String],
    spiritualGifts: [String],
    ministryInvolvement: String,
    prayerLife: String,
    bibleKnowledge: String,
    witnessOpportunities: [String],
    spiritualGrowthArc: [{
      chapter: Number,
      challenge: String,
      response: String,
      growth: String,
      scriptureReference: String
    }]
  },
  voice: {
    speechPatterns: [String],
    vocabulary: {
      type: String,
      enum: ['simple', 'moderate', 'sophisticated', 'technical', 'colloquial']
    },
    dialectAccent: String,
    catchphrases: [String],
    communicationStyle: {
      type: String,
      enum: ['direct', 'indirect', 'formal', 'casual', 'diplomatic', 'blunt']
    },
    topics: {
      comfortable: [String],
      uncomfortable: [String],
      passionate: [String]
    }
  },
  appearance: {
    chapterIntroductions: [{
      chapter: Number,
      firstMention: String,
      fullDescription: String
    }],
    consistencyNotes: [String]
  },
  plotSignificance: {
    keyScenes: [{
      chapter: Number,
      scene: String,
      role: String,
      importance: String
    }],
    plotPoints: [String],
    conflicts: [{
      type: {
        type: String,
        enum: ['internal', 'interpersonal', 'societal', 'supernatural', 'environmental']
      },
      description: String,
      chapters: [Number],
      resolution: String
    }]
  },
  symbolism: {
    represents: [String],
    associatedSymbols: [String],
    thematicRole: String
  }
}, {
  timestamps: true
});

// Indexes for performance
characterSchema.index({ novel: 1 });
characterSchema.index({ role: 1 });
characterSchema.index({ 'name.first': 1, 'name.last': 1 });

// Virtual for full name
characterSchema.virtual('fullName').get(function() {
  const parts = [];
  if (this.name.title) parts.push(this.name.title);
  if (this.name.first) parts.push(this.name.first);
  if (this.name.last) parts.push(this.name.last);
  return parts.join(' ');
});

// Method to get character context for chapter generation
characterSchema.methods.getGenerationContext = function() {
  return {
    name: this.fullName,
    role: this.role,
    personality: {
      traits: this.personality.traits,
      motivations: this.personality.motivations,
      values: this.personality.values
    },
    voice: this.voice,
    currentArcStage: this.getCurrentArcStage(),
    faithJourney: this.faithJourney.spiritualState,
    relationships: this.relationships
  };
};

// Method to determine current arc stage based on chapter
characterSchema.methods.getCurrentArcStage = function(chapterNumber) {
  if (!chapterNumber) return 'beginning';
  
  const growthMoments = this.characterArc.growthMoments || [];
  const climaxChapter = this.characterArc.climax?.chapter;
  
  if (climaxChapter && chapterNumber >= climaxChapter) {
    return 'resolution';
  }
  
  const relevantMoments = growthMoments.filter(moment => moment.chapter <= chapterNumber);
  if (relevantMoments.length === 0) return 'beginning';
  if (relevantMoments.length <= growthMoments.length / 2) return 'development';
  return 'transformation';
};

module.exports = mongoose.model('Character', characterSchema);
