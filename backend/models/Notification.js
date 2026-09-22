import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['interview', 'application', 'job', 'system', 'resume', 'skill'],
    default: 'system'
  },
  link: { type: String, default: '' },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
