import { Interview } from '../models/Interview.js';
import { Notification } from '../models/Notification.js';

// @desc    Get user's interviews
// @route   GET /api/interviews
// @access  Private
export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .populate('applicationId')
      .sort({ date: 1 })
      .lean();

    const now = new Date();
    const upcoming = interviews.filter(i => new Date(i.date) >= now && i.status === 'Scheduled');
    const past = interviews.filter(i => new Date(i.date) < now || i.status !== 'Scheduled');

    res.status(200).json({
      success: true,
      count: interviews.length,
      upcoming,
      past,
      interviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule / Create an interview
// @route   POST /api/interviews
// @access  Private
export const createInterview = async (req, res, next) => {
  try {
    const { company, role, date, time, type, locationOrLink, notes, round, interviewerName, applicationId } = req.body;

    if (!company || !role || !date) {
      return res.status(400).json({
        success: false,
        message: 'Company, role, and date are required.'
      });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      applicationId: applicationId || null,
      company: company.trim(),
      role: role.trim(),
      date: new Date(date),
      time: time || '10:00 AM',
      type: type || 'Technical',
      locationOrLink: locationOrLink || 'Google Meet / Zoom',
      notes: notes || '',
      round: round || 'Round 1',
      interviewerName: interviewerName || '',
      status: 'Scheduled'
    });

    await Notification.create({
      userId: req.user._id,
      title: 'Interview Scheduled',
      message: `${type || 'Technical'} interview scheduled with ${company} on ${new Date(date).toLocaleDateString()} at ${time || '10:00 AM'}.`,
      type: 'interview',
      link: '/interviews'
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details or status
// @route   PUT /api/interviews/:id
// @access  Private
export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized.'
      });
    }

    const allowedUpdates = [
      'company', 'role', 'date', 'time', 'type', 'locationOrLink',
      'status', 'round', 'interviewerName', 'notes', 'preparationNotes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        interview[field] = req.body[field];
      }
    });

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Private
export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview removed.'
    });
  } catch (error) {
    next(error);
  }
};
