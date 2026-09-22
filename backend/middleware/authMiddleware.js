import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'career_flow_super_secure_jwt_secret_dev_2025');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Authorization denied.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token verification failed. Please log in again.'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided.'
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'career_flow_super_secure_jwt_secret_dev_2025');
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
};
