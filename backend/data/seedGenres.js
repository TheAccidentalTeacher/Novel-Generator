const mongoose = require('mongoose');
const Genre = require('../models/Genre');
require('dotenv').config();

const genres = [
  {
    name: 'Christian Fiction',
    category: 'Christian Fiction',
    priority: 10,
    subGenres: ['Contemporary Christian', 'Historical Christian', 'Christian Romance', 'Christian Suspense'],
    definition: {
      description: 'Fiction that incorporates Christian themes, values, and worldview into compelling narratives that inspire, encourage, and entertain readers while remaining true to biblical principles.',
      targetAudience: 'Christian readers seeking faith-affirming entertainment and spiritual encouragement',
      readerExpectations: [
        'Authentic faith journeys and spiritual growth',
        'Moral characters facing realistic challenges',
        'Hope and redemption themes',
        'Biblical worldview integration',
        'Clean content appropriate for family reading'
      ],
      keyCharacteristics: [
        'Faith as central element without being preachy',
        'Character development through spiritual challenges',
        'Organic integration of biblical principles',
        'Realistic portrayal of Christian life',
        'Hope and redemption themes'
      ]
    },
    structure: {
      commonNarrativeStructures: [
        'Spiritual journey arc',
        'Prodigal son pattern',
        'Faith tested and strengthened',
        'Community and fellowship development'
      ],
      typicalPlotArcs: [
        'Character faces crisis that challenges faith',
        'Period of doubt or spiritual struggle',
        'Support from Christian community',
        'Spiritual breakthrough or renewed faith',
        'Character emerges stronger in faith'
      ],
      pacingGuidelines: 'Moderate pacing with time for reflection and spiritual development',
      chapterStructure: 'Character-driven chapters focusing on internal and external conflicts',
      wordCountGuidelines: {
        novel: { min: 60000, max: 90000, target: 75000 },
        chapter: { min: 1750, max: 2250, target: 2000 }
      }
    },
    characters: {
      archetypes: [
        {
          name: 'Seeker',
          description: 'Character questioning or exploring faith',
          commonTraits: ['Curious', 'Doubtful', 'Open-minded', 'Searching'],
          typicalRole: 'Protagonist or important secondary character',
          developmentPatterns: ['Gradual faith development', 'Questions leading to understanding']
        },
        {
          name: 'Mature Believer',
          description: 'Established Christian facing new challenges',
          commonTraits: ['Wise', 'Faithful', 'Tested', 'Mentoring'],
          typicalRole: 'Mentor or co-protagonist',
          developmentPatterns: ['Deepening faith through trials', 'Learning to trust God more fully']
        },
        {
          name: 'Prodigal',
          description: 'Character who has walked away from faith',
          commonTraits: ['Conflicted', 'Hurt', 'Resistant', 'Longing'],
          typicalRole: 'Protagonist',
          developmentPatterns: ['Journey back to faith', 'Healing from past wounds']
        }
      ],
      relationships: {
        commonDynamics: ['Mentor-student relationships', 'Christian community support', 'Family faith dynamics'],
        conflictPatterns: ['Faith vs. world pressures', 'Different Christian perspectives', 'Spiritual warfare'],
        resolutionApproaches: ['Prayer and seeking God', 'Community support', 'Biblical wisdom application']
      },
      developmentGuidelines: [
        'Show realistic spiritual growth',
        'Include authentic struggles and doubts',
        'Demonstrate faith in action',
        'Avoid perfect Christian stereotypes',
        'Show diverse expressions of faith'
      ]
    },
    style: {
      languagePatterns: ['Clean, wholesome language', 'Biblical metaphors and imagery', 'Hopeful tone'],
      toneGuidelines: ['Inspirational but not preachy', 'Authentic and relatable', 'Hope-filled'],
      voiceCharacteristics: ['Warm and engaging', 'Thoughtful and reflective', 'Encouraging'],
      punctuationPreferences: ['Standard punctuation', 'Em dashes for emphasis (max 1 per chapter)'],
      sentenceStructure: ['Varied sentence lengths', 'Clear and accessible prose'],
      paragraphGuidelines: ['Moderate length', 'Clear transitions', 'Thoughtful pacing']
    },
    content: {
      thematicElements: ['Faith and trust in God', 'Forgiveness and redemption', 'Love and sacrifice', 'Purpose and calling'],
      commonThemes: ['God\'s faithfulness', 'Overcoming trials', 'Community and fellowship', 'Spiritual growth'],
      appropriateTopics: ['Marriage and family', 'Career and calling', 'Social justice', 'Personal struggles'],
      contentRestrictions: ['No profanity', 'No explicit sexual content', 'No glorification of sin', 'No blasphemy'],
      sensitivities: ['Respectful treatment of faith', 'Accurate biblical representation', 'Cultural sensitivity'],
      moralFramework: 'Biblical Christian worldview and ethics'
    },
    christianSpecific: {
      theologyGuidelines: [
        'Accurate biblical representation',
        'Avoid denominational bias when possible',
        'Present grace and truth balance',
        'Show God\'s love and justice'
      ],
      scriptureIntegration: {
        frequency: 'Natural and organic, not forced',
        methods: ['Character reflection', 'Church or Bible study scenes', 'Prayer and meditation'],
        contexts: ['Comfort in difficulty', 'Guidance for decisions', 'Worship and praise']
      },
      faithElements: {
        prayer: 'Regular, authentic prayer as part of character development',
        worship: 'Corporate and personal worship experiences',
        fellowship: 'Christian community and mutual support',
        witnessing: 'Natural sharing of faith through actions and words',
        discipleship: 'Growth in Christian maturity and understanding'
      },
      contentStandards: {
        language: 'Clean, no profanity or crude language',
        violence: 'Minimal, not graphic, with purpose for story',
        sexuality: 'Marriage context only, non-explicit',
        substances: 'Realistic portrayal of problems without glorification',
        themes: ['Hope', 'Redemption', 'Love', 'Faith', 'Community']
      },
      spiritualArc: {
        commonJourneys: ['Salvation experience', 'Spiritual growth', 'Calling discovery', 'Faith testing'],
        growthPatterns: ['Crisis leading to growth', 'Gradual maturation', 'Breakthrough moments'],
        challengeTypes: ['Doubt and questions', 'Persecution or opposition', 'Personal sin struggles'],
        resolutionApproaches: ['Surrender to God', 'Community support', 'Biblical truth application']
      }
    },
    promptingStrategies: {
      planning: {
        premiseGeneration: 'Focus on authentic faith struggles and realistic Christian life situations that create compelling conflicts while maintaining hope and redemption themes.',
        outlineCreation: 'Develop character arcs that show spiritual growth through realistic challenges, ensuring faith elements are woven naturally throughout the story structure.',
        characterDevelopment: 'Create multi-dimensional characters with authentic faith journeys, avoiding stereotypes while showing diverse expressions of Christian life.',
        themeIntegration: 'Weave biblical themes organically into plot and character development without being heavy-handed or preachy.'
      },
      drafting: {
        chapterGeneration: 'Write chapters that advance both plot and spiritual development, showing faith in action through character decisions and relationships.',
        dialogueGuidance: 'Create natural dialogue that reflects Christian worldview without being artificial or overly theological.',
        sceneConstruction: 'Build scenes that serve both story advancement and character spiritual development.',
        pacingInstructions: 'Allow adequate time for reflection and spiritual processing while maintaining story momentum.'
      },
      reviewing: {
        qualityChecks: ['Authentic faith representation', 'Natural dialogue', 'Appropriate content', 'Hope and redemption presence'],
        consistencyVerification: ['Character faith development consistency', 'Biblical accuracy', 'Worldview consistency'],
        genreCompliance: ['Christian values upheld', 'Clean content maintained', 'Faith integral to story']
      }
    }
  },
  {
    name: 'Mystery',
    category: 'Mystery',
    priority: 9,
    subGenres: ['Cozy Mystery', 'Police Procedural', 'Private Detective', 'Amateur Sleuth'],
    definition: {
      description: 'Fiction centered around a puzzle or crime that must be solved, typically involving investigation, clues, and the gradual revelation of truth through logical deduction.',
      targetAudience: 'Readers who enjoy puzzles, intellectual challenges, and the satisfaction of solving mysteries',
      readerExpectations: [
        'A central mystery or crime to be solved',
        'Logical clues and red herrings',
        'Fair play with readers',
        'Satisfying resolution',
        'Engaging detective or protagonist'
      ],
      keyCharacteristics: [
        'Central puzzle drives the plot',
        'Clues revealed progressively',
        'Multiple suspects with motives',
        'Investigation process shown',
        'Logical resolution based on evidence'
      ]
    },
    structure: {
      commonNarrativeStructures: [
        'Crime committed, investigation, revelation',
        'Puzzle presented, clues gathered, solution revealed',
        'Mystery deepens before resolution'
      ],
      typicalPlotArcs: [
        'Crime or mystery introduced',
        'Initial investigation and suspect identification',
        'Complications and red herrings',
        'Breakthrough discovery',
        'Confrontation and resolution'
      ],
      pacingGuidelines: 'Steady progression with regular clue revelations and escalating tension',
      chapterStructure: 'Each chapter should advance investigation or deepen mystery',
      wordCountGuidelines: {
        novel: { min: 70000, max: 90000, target: 80000 },
        chapter: { min: 1750, max: 2250, target: 2000 }
      }
    },
    characters: {
      archetypes: [
        {
          name: 'Detective',
          description: 'Professional or amateur investigator',
          commonTraits: ['Observant', 'Logical', 'Persistent', 'Intuitive'],
          typicalRole: 'Protagonist',
          developmentPatterns: ['Growing understanding of case', 'Personal stakes increase']
        },
        {
          name: 'Suspect',
          description: 'Character with motive and opportunity',
          commonTraits: ['Secretive', 'Defensive', 'Complex motives'],
          typicalRole: 'Supporting character',
          developmentPatterns: ['Revealed motivations', 'True nature exposed']
        }
      ],
      relationships: {
        commonDynamics: ['Investigator-suspect tension', 'Professional partnerships', 'Victim connections'],
        conflictPatterns: ['Hidden secrets revealed', 'Trust vs. suspicion', 'Professional vs. personal'],
        resolutionApproaches: ['Truth revelation', 'Justice served', 'Closure achieved']
      }
    },
    promptingStrategies: {
      planning: {
        premiseGeneration: 'Create intriguing crimes or mysteries with logical solutions and multiple viable suspects.',
        outlineCreation: 'Plan clue revelation timing and red herrings to maintain reader engagement.',
        characterDevelopment: 'Develop complex characters with believable motives and secrets.',
        themeIntegration: 'Incorporate themes of justice, truth, and human nature.'
      },
      drafting: {
        chapterGeneration: 'Each chapter should advance the investigation or deepen the mystery.',
        dialogueGuidance: 'Create realistic interrogation and investigation dialogue.',
        sceneConstruction: 'Build tension through revelation and misdirection.',
        pacingInstructions: 'Maintain steady pace with regular developments.'
      }
    }
  },
  {
    name: 'Cozy Mystery',
    category: 'Mystery',
    priority: 8,
    subGenres: ['Amateur Sleuth', 'Small Town Mystery', 'Hobby-based Mystery'],
    definition: {
      description: 'A subgenre of mystery fiction characterized by a non-professional detective, minimal violence, small community setting, and emphasis on puzzle-solving over graphic content.',
      targetAudience: 'Readers seeking gentle mysteries with charming settings and relatable characters',
      readerExpectations: [
        'Amateur detective protagonist',
        'Small, close-knit community setting',
        'Minimal graphic violence',
        'Cozy, comfortable atmosphere',
        'Character-driven investigation'
      ]
    },
    structure: {
      wordCountGuidelines: {
        novel: { min: 60000, max: 80000, target: 70000 },
        chapter: { min: 1750, max: 2250, target: 2000 }
      }
    },
    promptingStrategies: {
      planning: {
        premiseGeneration: 'Create mysteries in charming settings with amateur sleuths and gentle conflicts.',
        outlineCreation: 'Focus on character relationships and community dynamics alongside mystery elements.'
      }
    }
  }
];

async function seedGenres() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelforge');
    console.log('Connected to MongoDB');

    // Clear existing genres
    await Genre.deleteMany({});
    console.log('Cleared existing genres');

    // Insert new genres
    const insertedGenres = await Genre.insertMany(genres);
    console.log(`Inserted ${insertedGenres.length} genres`);

    console.log('Genre seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding genres:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedGenres();
}

module.exports = { genres, seedGenres };
