import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';

// @desc    Get all applications for authenticated user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ updatedAt: -1 })
      .lean();

    // Group by status for Kanban view convenience
    const grouped = {
      Saved: [],
      Applied: [],
      Screening: [],
      Interview: [],
      Offer: [],
      Rejected: []
    };

    applications.forEach(app => {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      } else {
        grouped['Applied'].push(app);
      }
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
      grouped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res, next) => {
  try {
    const { jobId, status = 'Applied', notes, nextAction, nextDate, salaryOffer } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required.'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const existingApp = await Application.findOne({
      userId: req.user._id,
      jobId
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: `An application for ${job.title} at ${job.company} already exists.`
      });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      status,
      notes: notes ? [{ text: notes }] : [],
      nextAction: nextAction || '',
      nextDate: nextDate || null,
      salaryOffer: salaryOffer || ''
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Application Tracked',
      message: `Added ${job.title} at ${job.company} to your ${status} stage.`,
      type: 'application',
      link: '/applications'
    });

    const populatedApp = await Application.findById(application._id).populate('jobId');

    res.status(201).json({
      success: true,
      message: 'Application tracked successfully.',
      application: populatedApp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application stage or details
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res, next) => {
  try {
    const { status, nextAction, nextDate, salaryOffer, newNote } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized.'
      });
    }

    const oldStatus = application.status;

    if (status && status !== oldStatus) {
      application.status = status;
      // Add system log note for status transition
      application.notes.push({
        text: `Moved stage from ${oldStatus} to ${status} on ${new Date().toLocaleDateString()}`
      });

      // Spawn notifications on key transitions
      if (status === 'Interview') {
        await Notification.create({
          userId: req.user._id,
          title: '🎉 Interview Stage Reached!',
          message: `Congratulations! ${application.jobId?.company} moved you to Interview. Check the Interview Prep tab to generate questions.`,
          type: 'interview',
          link: '/interview-prep'
        });
      } else if (status === 'Offer') {
        await Notification.create({
          userId: req.user._id,
          title: '🌟 Job Offer Received!',
          message: `Amazing news! You received an offer from ${application.jobId?.company}.`,
          type: 'application',
          link: '/applications'
        });
      }
    }

    if (nextAction !== undefined) application.nextAction = nextAction;
    if (nextDate !== undefined) application.nextDate = nextDate;
    if (salaryOffer !== undefined) application.salaryOffer = salaryOffer;
    if (newNote && newNote.trim()) {
      application.notes.push({ text: newNote.trim() });
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted from tracker.'
    });
  } catch (error) {
    next(error);
  }
};
