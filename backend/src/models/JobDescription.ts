import { Schema, model, Types } from 'mongoose';

const jobDescriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  descriptionText: {
    type: String,
    required: true
  },
  analysisResults: {
    matchPercentage: { type: Number, required: true },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    matchingKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    recommendedImprovements: [{ type: String }],
    companyReadinessScore: { type: Number, required: true }
  }
}, {
  timestamps: true
});

export const JobDescription = model('JobDescription', jobDescriptionSchema);
