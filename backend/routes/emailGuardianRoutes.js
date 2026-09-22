import express from 'express';
import { analyzeEmail } from '../controllers/emailGuardianController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeEmail);

export default router;
