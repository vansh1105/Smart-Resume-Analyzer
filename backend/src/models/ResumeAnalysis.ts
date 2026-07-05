import { Schema, model, Types } from 'mongoose';

const resumeAnalysisSchema = new Schema({
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  sectionBreakdown: {
    completeness: { type: Number, default: 0 },
    contactInfo: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    keywordDensity: { type: Number, default: 0 },
    actionVerbs: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 }
  },
  suggestions: [{ type: String }],
  aiFeedback: {
    summary: { type: String, default: '' },
    grammarCorrections: [{
      original: { type: String, default: '' },
      corrected: { type: String, default: '' },
      reason: { type: String, default: '' }
    }],
    bulletPointImprovements: [{
      original: { type: String, default: '' },
      suggested: { type: String, default: '' },
      impact: { type: String, default: '' }
    }],
    skillSuggestions: [{ type: String }],
    careerSuggestions: [{ type: String }],
    generalImprovements: [{ type: String }]
  },
  projectCritique: [{
    projectTitle: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingTech: [{ type: String }],
    impactScore: { type: Number, default: 0 },
    improvementSuggestions: [{ type: String }]
  }],
  interviewQuestions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['technical', 'hr', 'project', 'behavioral'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    suggestedAnswer: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

export const ResumeAnalysis = model('ResumeAnalysis', resumeAnalysisSchema);
