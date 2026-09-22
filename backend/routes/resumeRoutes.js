import express from 'express';
import {
  getResume,
  saveResume,
  analyzeResume,
  matchResumeJob
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResume)
  .post(saveResume);

router.post('/analyze', analyzeResume);
router.post('/match-job', matchResumeJob);

export default router;
