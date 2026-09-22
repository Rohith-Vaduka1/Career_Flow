import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { Resume } from '../models/Resume.js';
import { Notification } from '../models/Notification.js';
import { SAMPLE_JOBS } from './seedData.js';
import { analyzeResumeATS } from '../services/atsService.js';

dotenv.config();

export const seedDatabase = async (force = false) => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount >= 15 && !force) {
      console.log(`[Database Seeder] Database already populated with ${jobCount} jobs. Skipping job seeding.`);
      return;
    }

    if (force) {
      console.log('[Database Seeder] Force flag set. Clearing existing jobs...');
      await Job.deleteMany({});
    }

    // Insert Jobs
    const insertedJobs = await Job.insertMany(SAMPLE_JOBS);
    console.log(`[Database Seeder] Successfully seeded ${insertedJobs.length} realistic career jobs!`);

    // Check or create Demo User
    let demoUser = await User.findOne({ email: 'demo@careerflow.ai' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      demoUser = await User.create({
        name: 'Alex Mercer',
        email: 'demo@careerflow.ai',
        password: hashedPassword,
        headline: 'Full Stack & AI Engineer',
        bio: 'Passionate software engineer with 4 years of experience building modern web applications, scalable APIs, and exploring generative AI workflows.',
        location: 'Bengaluru, India',
        phone: '+91 98765 43210',
        targetRole: 'Full Stack Engineer',
        skills: [
          { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced' },
          { name: 'TypeScript', category: 'Programming', proficiency: 'Advanced' },
          { name: 'Python', category: 'Programming', proficiency: 'Intermediate' },
          { name: 'React.js', category: 'Frontend', proficiency: 'Advanced' },
          { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Advanced' },
          { name: 'Node.js', category: 'Backend', proficiency: 'Advanced' },
          { name: 'Express.js', category: 'Backend', proficiency: 'Advanced' },
          { name: 'MongoDB', category: 'Database', proficiency: 'Advanced' },
          { name: 'PostgreSQL', category: 'Database', proficiency: 'Intermediate' },
          { name: 'Docker', category: 'DevOps', proficiency: 'Intermediate' },
          { name: 'Git', category: 'Tools', proficiency: 'Advanced' },
          { name: 'RESTful API', category: 'Backend', proficiency: 'Advanced' }
        ],
        preferredRoles: ['Full Stack Engineer', 'Senior Frontend Engineer', 'Backend Developer'],
        preferredLocations: ['Bengaluru', 'Remote', 'Hyderabad'],
        workPreference: 'Hybrid',
        expectedSalary: '₹22 - 30 LPA',
        careerGoals: 'Lead engineering pods in fast-growing high-scale SaaS products and specialize in AI agent integrations.'
      });

      console.log('[Database Seeder] Created Demo User: demo@careerflow.ai / password123');

      // Create Demo Applications across Kanban stages
      if (insertedJobs.length >= 5) {
        const app1 = await Application.create({
          userId: demoUser._id,
          jobId: insertedJobs[1]._id, // Apex Cloud Solutions (Full Stack)
          status: 'Interview',
          appliedAt: new Date(Date.now() - 5 * 86400000),
          notes: [{ text: 'Technical round scheduled with engineering manager' }],
          nextAction: 'Review system design and React performance optimization',
          nextDate: new Date(Date.now() + 2 * 86400000)
        });

        const app2 = await Application.create({
          userId: demoUser._id,
          jobId: insertedJobs[0]._id, // NeuralFlow Labs (AI/ML)
          status: 'Applied',
          appliedAt: new Date(Date.now() - 3 * 86400000),
          notes: [{ text: 'Submitted resume highlighting Python and vector database side-projects' }],
          nextAction: 'Recruiter screening in progress'
        });

        const app3 = await Application.create({
          userId: demoUser._id,
          jobId: insertedJobs[2]._id, // Starlight Media (Frontend Architect)
          status: 'Screening',
          appliedAt: new Date(Date.now() - 8 * 86400000),
          notes: [{ text: 'Recruiter phone screening call completed favorably' }],
          nextAction: 'Waiting for hiring team invitation'
        });

        const app4 = await Application.create({
          userId: demoUser._id,
          jobId: insertedJobs[3]._id, // HyperScale Systems (Cloud & DevOps)
          status: 'Offer',
          appliedAt: new Date(Date.now() - 14 * 86400000),
          notes: [{ text: 'Offer received: ₹26 LPA + benefits' }],
          nextAction: 'Review compensation package and provide response by Friday',
          salaryOffer: '₹26,00,000 / year'
        });

        const app5 = await Application.create({
          userId: demoUser._id,
          jobId: insertedJobs[4]._id, // FinPulse Technologies
          status: 'Saved',
          appliedAt: new Date(),
          notes: [{ text: 'Need to tailor resume for Go and backend banking services' }],
          nextAction: 'Update resume with Go projects'
        });

        // Create Upcoming Interview for App 1
        await Interview.create({
          userId: demoUser._id,
          applicationId: app1._id,
          company: insertedJobs[1].company,
          role: insertedJobs[1].title,
          date: new Date(Date.now() + 2 * 86400000),
          time: '2:30 PM',
          type: 'Technical',
          round: 'Round 2 - Architecture & Coding',
          locationOrLink: 'https://meet.google.com/abc-flow-xyz',
          interviewerName: 'Sarah Jenkins (VP of Engineering)',
          notes: 'Focus on full-stack architecture, React state patterns, and API error handling.',
          status: 'Scheduled'
        });

        // Create Master Resume
        const resumeText = `Alex Mercer
Full Stack & AI Engineer
demo@careerflow.ai | +91 98765 43210 | Bengaluru, India | linkedin.com/in/alex-mercer

SUMMARY
Proactive Full Stack Engineer with 4 years of experience building modern web applications, distributed APIs, and real-time collaboration tools. Proven track record improving application latency by 35% and delivering customer-centric SaaS platforms using React, TypeScript, Node.js, and MongoDB.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, HTML5, CSS3
- Frontend: React.js, Next.js, Redux Toolkit, Tailwind CSS, Responsive Design
- Backend: Node.js, Express.js, RESTful APIs, WebSockets, Microservices
- Databases: MongoDB, PostgreSQL, Redis
- DevOps & Tools: Docker, Git, GitHub Actions, AWS (S3, EC2), Postman

PROFESSIONAL EXPERIENCE
Senior Full Stack Developer | Horizon Technologies | 2022 - Present
- Architected and shipped a multi-tenant analytics dashboard serving 45,000+ daily active users with 99.9% uptime.
- Optimized frontend rendering and bundle size, slashing initial load time by 42% and achieving 95+ Lighthouse score.
- Implemented robust JWT authentication, role-based access control, and rate limiting across 25+ microservices.
- Mentored 4 junior engineers on clean architecture, unit testing with Vitest, and agile sprint delivery.

Full Stack Developer | CodeCraft Studio | 2020 - 2022
- Built 10+ responsive client web applications using React, Tailwind CSS, and Node.js.
- Designed database schemas in MongoDB and PostgreSQL, reducing query latency by 28% through proper indexing.
- Created automated CI/CD deployment pipelines on GitHub Actions, cutting release deployment time in half.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology | 2016 - 2020 | CGPA: 8.9 / 10.0`;

        const atsEvaluation = analyzeResumeATS(resumeText, 'Full Stack Engineer');
        await Resume.create({
          userId: demoUser._id,
          title: 'Master Technical Resume 2025',
          rawText: resumeText,
          targetRole: 'Full Stack Engineer',
          atsScore: atsEvaluation.score,
          atsFeedback: atsEvaluation,
          isPrimary: true
        });

        // Add Initial Notifications
        await Notification.create({
          userId: demoUser._id,
          title: 'Upcoming Interview Reminder',
          message: `Your technical interview with ${insertedJobs[1].company} is scheduled in 2 days. Prepare questions using the Interview Prep module.`,
          type: 'interview',
          link: '/interviews'
        });

        await Notification.create({
          userId: demoUser._id,
          title: '🌟 High-Match Jobs Available',
          message: '6 new jobs match over 80% of your registered skills. Explore them now in Find Jobs.',
          type: 'job',
          link: '/jobs'
        });
      }
    }
  } catch (error) {
    console.error(`[Database Seeder] Error: ${error.message}`);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seeder.js')) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career_flow';
  mongoose.connect(uri)
    .then(async () => {
      console.log('[Database Seeder] Connected to MongoDB for CLI seed.');
      await seedDatabase(true);
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(err => {
      console.error('[Database Seeder] Connection failed:', err.message);
      process.exit(1);
    });
}
