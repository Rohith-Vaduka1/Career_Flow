import express from 'express';
import {
  getJobs,
  getJobById,
  getJobMatch,
  getAiJobFit,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyJob,
  checkJobScam
} from '../controllers/jobController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getJobs);
router.get('/saved', protect, getSavedJobs);
router.post('/check-scam', protect, checkJobScam);
router.get('/:id', optionalProtect, getJobById);
router.get('/:id/match', protect, getJobMatch);
router.post('/:id/ai-fit', protect, getAiJobFit);
router.post('/:id/save', protect, saveJob);
router.delete('/:id/save', protect, unsaveJob);
router.post('/:id/apply', protect, applyJob);

export default router;
