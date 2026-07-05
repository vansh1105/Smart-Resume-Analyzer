import { Schema, model, Types } from 'mongoose';

const resumeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  rawText: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['processing', 'parsed', 'failed'],
    default: 'processing'
  },
  error: {
    type: String,
    default: ''
  },
  parsedDetails: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    skills: [{ type: String }],
    education: [{
      school: { type: String, default: '' },
      degree: { type: String, default: '' },
      fieldOfStudy: { type: String, default: '' },
      startYear: { type: String, default: '' },
      endYear: { type: String, default: '' },
      gpa: { type: String, default: '' }
    }],
    experience: [{
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      description: { type: String, default: '' },
      highlights: [{ type: String }]
    }],
    projects: [{
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      technologies: [{ type: String }],
      url: { type: String, default: '' },
      impact: { type: String, default: '' }
    }],
    certifications: [{ type: String }],
    achievements: [{ type: String }]
  }
}, {
  timestamps: true
});

export const Resume = model('Resume', resumeSchema);
