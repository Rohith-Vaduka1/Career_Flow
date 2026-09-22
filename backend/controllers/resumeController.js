import { Resume } from '../models/Resume.js';
import { Job } from '../models/Job.js';
import { analyzeResumeATS, matchResumeWithJob } from '../services/atsService.js';
import { Notification } from '../models/Notification.js';

// @desc    Get user's active resume
// @route   GET /api/resume
// @access  Private
export const getResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ userId: req.user._id, isPrimary: true });

    if (!resume) {
      // Create initial starter resume template
      const defaultText = `${req.user.name}
${req.user.headline || 'Software Engineer'}
${req.user.email} | ${req.user.phone || '+1 (555) 019-2834'} | ${req.user.location || 'San Francisco, CA'}

SUMMARY
Driven software engineer with hands-on experience in modern web technologies, building scalable cloud architectures, and delivering clean, testable code. Passionate about solving complex distributed systems problems and optimizing application performance.

TECHNICAL SKILLS
- Programming: JavaScript, TypeScript, Python
- Frontend: React.js, Next.js, Redux, Tailwind CSS, HTML5, CSS3
- Backend: Node.js, Express.js, RESTful APIs, Microservices
- Databases: MongoDB, PostgreSQL, Redis
- Cloud & DevOps: Docker, AWS (S3, EC2), Git, CI/CD pipelines

EXPERIENCE
Software Engineer | TechCorp Inc. | 2023 - Present
- Architected and deployed microservices that handled 50,000+ daily active users, reducing latency by 32%.
- Spearheaded the frontend refactoring to React 18, improving initial page load speed by 45%.
- Automated CI/CD deployment pipelines using GitHub Actions, decreasing release cycle times from 2 days to 30 minutes.

Full Stack Developer Intern | Innovate Labs | 2022 - 2023
- Built responsive UI components using React and Tailwind CSS, increasing user session engagement by 20%.
- Integrated third-party payment gateways and secured API endpoints with JWT authentication.

EDUCATION
Bachelor of Science in Computer Science | State University | 2019 - 2023
- GPA: 3.8 / 4.0 | Dean's Honor List`;

      const analysis = analyzeResumeATS(defaultText, req.user.targetRole || 'Software Engineer');
      resume = await Resume.create({
        userId: req.user._id,
        title: 'Master Resume',
        rawText: defaultText,
        targetRole: req.user.targetRole || 'Software Engineer',
        atsScore: analysis.score,
        atsFeedback: analysis,
        isPrimary: true
      });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save and analyze resume
// @route   POST /api/resume
// @access  Private
export const saveResume = async (req, res, next) => {
  try {
    const { rawText, title, targetRole } = req.body;

    if (!rawText || rawText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required.'
      });
    }

    const role = targetRole || req.user.targetRole || 'Software Engineer';
    const analysis = analyzeResumeATS(rawText, role);

    let resume = await Resume.findOne({ userId: req.user._id, isPrimary: true });

    if (resume) {
      resume.rawText = rawText;
      if (title) resume.title = title;
      resume.targetRole = role;
      resume.atsScore = analysis.score;
      resume.atsFeedback = analysis;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        title: title || 'Master Resume',
        rawText,
        targetRole: role,
        atsScore: analysis.score,
        atsFeedback: analysis,
        isPrimary: true
      });
    }

    await Notification.create({
      userId: req.user._id,
      title: 'Resume Analyzed',
      message: `Your resume ATS Score is ${analysis.score}/100. Review recommendations in the Resume Center.`,
      type: 'resume',
      link: '/resume'
    });

    res.status(200).json({
      success: true,
      message: 'Resume saved and analyzed successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run ATS analysis on raw resume text
// @route   POST /api/resume/analyze
// @access  Private
export const analyzeResume = async (req, res, next) => {
  try {
    const { rawText, targetRole } = req.body;

    if (!rawText || rawText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text to analyze.'
      });
    }

    const analysis = analyzeResumeATS(rawText, targetRole || 'Software Engineer');

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match resume against a specific job
// @route   POST /api/resume/match-job
// @access  Private
export const matchResumeJob = async (req, res, next) => {
  try {
    const { resumeText, jobId } = req.body;

    if (!resumeText || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resumeText and jobId.'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const match = matchResumeWithJob(resumeText, job);

    res.status(200).json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        skills: job.skills
      },
      ...match
    });
  } catch (error) {
    next(error);
  }
};
