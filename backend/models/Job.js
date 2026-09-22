import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  logo: { type: String, default: '' },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  responsibilities: [{ type: String, trim: true }],
  requirements: [{ type: String, trim: true }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    index: true
  },
  workMode: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'Hybrid',
    index: true
  },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  salaryText: { type: String, default: 'Competitive' },
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Staff', 'Executive'],
    default: 'Mid Level',
    index: true
  },
  skills: [{
    type: String,
    trim: true,
    index: true
  }],
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time',
    index: true
  },
  department: { type: String, default: 'Engineering' },
  source: { type: String, default: 'Career Flow' },
  sourceUrl: { type: String, default: '' },
  postedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Text index for search
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
  skills: 'text'
});

export const Job = mongoose.model('Job', jobSchema);
