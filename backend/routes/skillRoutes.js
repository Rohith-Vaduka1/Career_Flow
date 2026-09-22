import express from 'express';
import {
  getSkillCategories,
  getSkillGap,
  updateSkills
} from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getSkillCategories);
router.get('/gap', protect, getSkillGap);
router.post('/', protect, updateSkills);

export default router;
