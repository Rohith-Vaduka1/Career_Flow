import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Notification } from '../models/Notification.js';
import { calculateSkillMatch } from '../services/matchingService.js';
import { generateJobFitAnalysis, callOpenAI, analyzeEmailAndJobRisk } from '../services/aiService.js';

// @desc    Get all jobs with search, filtering, sorting, pagination & user match scoring
// @route   GET /api/jobs
// @access  Public (Enhanced if authenticated)
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      workMode,
      experience,
      employmentType,
      skill,
      minSalary,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Keyword search across title, company, description, and location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { skills: searchRegex }
      ];
    }

    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    if (experience && experience !== 'All') {
      query.experience = experience;
    }

    if (employmentType && employmentType !== 'All') {
      query.employmentType = employmentType;
    }

    if (skill && skill.trim() !== '') {
      query.skills = { $in: [new RegExp(skill.trim(), 'i')] };
    }

    if (minSalary && !isNaN(Number(minSalary))) {
      query.salaryMax = { $gte: Number(minSalary) };
    }

    let sortOptions = { postedAt: -1 };
    if (sortBy === 'salary_desc') {
      sortOptions = { salaryMax: -1, postedAt: -1 };
    } else if (sortBy === 'salary_asc') {
      sortOptions = { salaryMin: 1, postedAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { postedAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // If user is authenticated, compute skill matches and saved status
    let user = null;
    let savedJobIds = new Set();
    let appliedJobIds = new Set();

    if (req.user) {
      user = await User.findById(req.user._id).select('skills savedJobs').lean();
      if (user?.savedJobs) {
        savedJobIds = new Set(user.savedJobs.map(id => id.toString()));
      }
      const applications = await Application.find({ userId: req.user._id }).select('jobId status').lean();
      appliedJobIds = new Set(applications.map(app => app.jobId.toString()));
    }

    const enrichedJobs = jobs.map(job => {
      const matchResult = user ? calculateSkillMatch(user.skills, job.skills) : null;
      return {
        ...job,
        isSaved: savedJobIds.has(job._id.toString()),
        isApplied: appliedJobIds.has(job._id.toString()),
        matchScore: matchResult ? matchResult.matchPercentage : null,
        matchDetails: matchResult
      };
    });

    // If sortBy === 'match_desc' and user is authenticated, sort by match score
    if (sortBy === 'match_desc' && user) {
      enrichedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    res.status(200).json({
      success: true,
      count: enrichedJobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / limitNum),
      currentPage: pageNum,
      jobs: enrichedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (Enhanced if authenticated)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    let isSaved = false;
    let application = null;
    let matchDetails = null;

    if (req.user) {
      const user = await User.findById(req.user._id).select('skills savedJobs').lean();
      if (user?.savedJobs) {
        isSaved = user.savedJobs.some(id => id.toString() === job._id.toString());
      }
      application = await Application.findOne({ userId: req.user._id, jobId: job._id }).lean();
      matchDetails = calculateSkillMatch(user?.skills || [], job.skills || []);
    }

    res.status(200).json({
      success: true,
      job: {
        ...job,
        isSaved,
        application,
        matchScore: matchDetails?.matchPercentage || null,
        matchDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate deterministic skill match for a job
// @route   GET /api/jobs/:id/match
// @access  Private
export const getJobMatch = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const user = await User.findById(req.user._id);
    const match = calculateSkillMatch(user.skills, job.skills);

    res.status(200).json({
      success: true,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      ...match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-driven deep job fit analysis
// @route   POST /api/jobs/:id/ai-fit
// @access  Private
export const getAiJobFit = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const user = await User.findById(req.user._id);
    const fallbackFit = generateJobFitAnalysis(job, user);

    // Try OpenAI if configured
    const promptMessages = [
      {
        role: 'system',
        content: 'You are an elite career architect. Provide a precise JSON analysis of how well a candidate fits a job.'
      },
      {
        role: 'user',
        content: JSON.stringify({
          job: {
            title: job.title,
            company: job.company,
            description: job.description,
            skills: job.skills
          },
          candidate: {
            headline: user.headline,
            skills: user.skills.map(s => s.name),
            experience: user.experience,
            careerGoals: user.careerGoals
          }
        })
      }
    ];

    const aiResponse = await callOpenAI(promptMessages, { json: true });
    let analysisResult = fallbackFit;
    if (aiResponse) {
      try {
        analysisResult = JSON.parse(aiResponse);
      } catch {
        analysisResult = fallbackFit;
      }
    }

    res.status(200).json({
      success: true,
      analysis: analysisResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/jobs/:id/save
// @access  Private
export const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedJobs: job._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Job saved to your list.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave a job
// @route   DELETE /api/jobs/:id/save
// @access  Private
export const unsaveJob = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedJobs: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Job removed from saved list.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/jobs/saved
// @access  Private
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedJobs')
      .lean();

    const savedJobs = user.savedJobs || [];
    const enriched = savedJobs.map(job => {
      const match = calculateSkillMatch(user.skills, job.skills);
      return {
        ...job,
        isSaved: true,
        matchScore: match.matchPercentage,
        matchDetails: match
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      jobs: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to a job (creates Application record)
// @route   POST /api/jobs/:id/apply
// @access  Private
export const applyJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    let application = await Application.findOne({
      userId: req.user._id,
      jobId: job._id
    });

    if (application) {
      return res.status(400).json({
        success: false,
        message: `You have already submitted an application for ${job.title} at ${job.company}. Current stage: ${application.status}.`
      });
    }

    application = await Application.create({
      userId: req.user._id,
      jobId: job._id,
      status: 'Applied',
      appliedAt: new Date(),
      notes: [{
        text: `Application submitted via Career Flow on ${new Date().toLocaleDateString()}`
      }],
      nextAction: 'Await recruiter screening or follow up in 5 business days'
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      title: 'Application Submitted',
      message: `You successfully applied for ${job.title} at ${job.company}. Track its status in your Applications Kanban.`,
      type: 'application',
      link: '/applications'
    });

    res.status(201).json({
      success: true,
      message: `Successfully applied to ${job.company}!`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan job for potential scam indicators
// @route   POST /api/jobs/check-scam
// @access  Private
export const checkJobScam = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job description content to analyze.'
      });
    }

    const assessment = analyzeEmailAndJobRisk(content);

    res.status(200).json({
      success: true,
      assessment
    });
  } catch (error) {
    next(error);
  }
};
