import express from 'express';
import {
  chatWithAssistant,
  generateQuestions,
  evaluateAnswer,
  getRoadmap
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/chat', chatWithAssistant);
router.post('/interview-prep/generate', generateQuestions);
router.post('/mock-interview/evaluate', evaluateAnswer);
router.post('/career-roadmap', getRoadmap);

export default router;
