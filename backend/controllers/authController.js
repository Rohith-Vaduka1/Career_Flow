import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'career_flow_super_secure_jwt_secret_dev_2025', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, headline, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default starter skills for a great first-time onboarding experience
    const defaultSkills = [
      { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced' },
      { name: 'React.js', category: 'Frontend', proficiency: 'Advanced' },
      { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate' },
      { name: 'MongoDB', category: 'Database', proficiency: 'Intermediate' },
      { name: 'Git', category: 'Tools', proficiency: 'Advanced' }
    ];

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      headline: headline || 'Software Engineer',
      targetRole: targetRole || 'Full Stack Engineer',
      skills: defaultSkills
    });

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.profileCompletion = user.getProfileCompletion();

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.profileCompletion = user.getProfileCompletion();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userResponse = user.toObject();
    userResponse.profileCompletion = user.getProfileCompletion();

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'location', 'headline', 'bio', 'education',
      'experience', 'skills', 'preferredRoles', 'preferredLocations',
      'workPreference', 'expectedSalary', 'careerGoals', 'targetRole'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    const userResponse = user.toObject();
    userResponse.profileCompletion = user.getProfileCompletion();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};
