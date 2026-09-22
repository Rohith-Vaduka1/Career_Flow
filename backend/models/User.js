import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: [
      'Programming',
      'Frontend',
      'Backend',
      'Database',
      'AI/ML',
      'Cloud',
      'DevOps',
      'Tools',
      'Soft Skills'
    ],
    default: 'Programming'
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  }
}, { _id: true });

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: String, trim: true },
  endYear: { type: String, trim: true }
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  education: [educationSchema],
  experience: [experienceSchema],
  skills: [skillSchema],
  preferredRoles: [{ type: String, trim: true }],
  preferredLocations: [{ type: String, trim: true }],
  workPreference: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site', 'Any'],
    default: 'Any'
  },
  expectedSalary: { type: String, default: '' },
  careerGoals: { type: String, default: '' },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  targetRole: { type: String, default: 'Full Stack Engineer' }
}, {
  timestamps: true
});

userSchema.methods.getProfileCompletion = function() {
  let score = 0;
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (this.headline) score += 10;
  if (this.bio) score += 10;
  if (this.location) score += 5;
  if (this.phone) score += 5;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  if (this.careerGoals) score += 5;
  return Math.min(score, 100);
};

export const User = mongoose.model('User', userSchema);
