import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';

// @desc    Global search across Jobs, Applications, and Interviews
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json({
        success: true,
        results: { jobs: [], applications: [], interviews: [] }
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const [jobs, applications, interviews] = await Promise.all([
      Job.find({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { skills: searchRegex },
          { location: searchRegex }
        ]
      })
        .limit(6)
        .select('title company location salaryText workMode skills')
        .lean(),

      Application.find({
        userId: req.user._id,
        $or: [
          { status: searchRegex },
          { nextAction: searchRegex },
          { 'notes.text': searchRegex }
        ]
      })
        .populate('jobId', 'title company location')
        .limit(6)
        .lean(),

      Interview.find({
        userId: req.user._id,
        $or: [
          { company: searchRegex },
          { role: searchRegex },
          { type: searchRegex },
          { notes: searchRegex }
        ]
      })
        .limit(6)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      query: q.trim(),
      results: {
        jobs,
        applications,
        interviews
      }
    });
  } catch (error) {
    next(error);
  }
};
