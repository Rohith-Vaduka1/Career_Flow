import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../config/constants.js';

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: APPLICATION_STATUSES,
    default: 'Applied',
    index: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: [noteSchema],
  nextAction: { type: String, default: '' },
  nextDate: { type: Date },
  salaryOffer: { type: String, default: '' },
  interviewDate: { type: Date }
}, {
  timestamps: true
});

// Composite index to avoid duplicate applications per user per job
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
