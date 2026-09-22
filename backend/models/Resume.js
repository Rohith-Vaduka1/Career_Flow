import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'My Primary Resume',
    trim: true
  },
  rawText: {
    type: String,
    required: [true, 'Resume text content is required']
  },
  summary: { type: String, default: '' },
  parsedSkills: [{ type: String, trim: true }],
  targetRole: { type: String, default: 'Software Engineer' },
  atsScore: { type: Number, default: 0 },
  atsFeedback: {
    score: { type: Number, default: 0 },
    breakdown: {
      keywords: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
      experienceImpact: { type: Number, default: 0 },
      sectionCompleteness: { type: Number, default: 0 }
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingKeywords: [{ type: String }],
    recommendations: [{ type: String }]
  },
  isPrimary: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Resume = mongoose.model('Resume', resumeSchema);
