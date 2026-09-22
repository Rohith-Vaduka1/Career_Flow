import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
