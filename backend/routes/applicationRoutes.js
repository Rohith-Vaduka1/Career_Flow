import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All application routes require authentication

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .put(updateApplication)
  .delete(deleteApplication);

export default router;
