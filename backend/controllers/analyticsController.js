import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { Job } from '../models/Job.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { calculateSkillMatch } from '../services/matchingService.js';

// @desc    Get user analytics and job search metrics
// @route   GET /api/analytics
// @access  Private
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).lean();
    const applications = await Application.find({ userId }).populate('jobId').lean();
    const interviews = await Interview.find({ userId }).lean();
    const resume = await Resume.findOne({ userId, isPrimary: true }).lean();
    const totalJobsInDb = await Job.countDocuments();

    const statusCounts = {
      Saved: 0,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };

    applications.forEach(app => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    const totalApplications = applications.length;
    const activeSubmissions = applications.filter(a => a.status !== 'Saved').length;

    // Conversion rates
    const interviewCount = statusCounts.Interview + statusCounts.Offer;
    const interviewConversion = activeSubmissions > 0
      ? Math.round((interviewCount / activeSubmissions) * 100)
      : 0;

    const offerCount = statusCounts.Offer;
    const offerConversion = activeSubmissions > 0
      ? Math.round((offerCount / activeSubmissions) * 100)
      : 0;

    // Timeline of applications over past 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyData[key] = 0;
    }

    applications.forEach(app => {
      const appDate = new Date(app.appliedAt || app.createdAt);
      const key = `${monthNames[appDate.getMonth()]} ${appDate.getFullYear()}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    });

    const timeline = Object.keys(monthlyData).map(month => ({
      month,
      applications: monthlyData[month]
    }));

    // Calculate High Match Jobs in Database
    const sampleJobs = await Job.find().limit(30).lean();
    let highMatchCount = 0;
    let avgMatchScore = 0;

    if (sampleJobs.length > 0 && user.skills?.length > 0) {
      let totalScore = 0;
      sampleJobs.forEach(job => {
        const match = calculateSkillMatch(user.skills, job.skills);
        totalScore += match.matchPercentage;
        if (match.matchPercentage >= 75) highMatchCount++;
      });
      avgMatchScore = Math.round(totalScore / sampleJobs.length);
    }

    res.status(200).json({
      success: true,
      data: {
        hasData: totalApplications > 0,
        totalApplications,
        activeSubmissions,
        statusCounts,
        conversionRates: {
          interviewRate: interviewConversion,
          offerRate: offerConversion
        },
        interviewsTotal: interviews.length,
        upcomingInterviews: interviews.filter(i => new Date(i.date) >= now && i.status === 'Scheduled').length,
        savedJobsCount: user.savedJobs?.length || 0,
        skillsTracked: user.skills?.length || 0,
        resumeScore: resume?.atsScore || 0,
        highMatchJobsCount: highMatchCount,
        avgMatchScore,
        timeline,
        targetRole: user.targetRole || 'Full Stack Engineer'
      }
    });
  } catch (error) {
    next(error);
  }
};
