import mongoose from 'mongoose';
import { INTERVIEW_STATUSES, INTERVIEW_TYPES } from '../config/constants.js';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Interview date is required']
  },
  time: {
    type: String,
    default: '10:00 AM'
  },
  type: {
    type: String,
    enum: INTERVIEW_TYPES,
    default: 'Technical'
  },
  locationOrLink: {
    type: String,
    default: 'Google Meet / Zoom'
  },
  status: {
    type: String,
    enum: INTERVIEW_STATUSES,
    default: 'Scheduled',
    index: true
  },
  round: {
    type: String,
    default: 'Round 1'
  },
  interviewerName: { type: String, default: '' },
  notes: { type: String, default: '' },
  preparationNotes: { type: String, default: '' }
}, {
  timestamps: true
});

export const Interview = mongoose.model('Interview', interviewSchema);
