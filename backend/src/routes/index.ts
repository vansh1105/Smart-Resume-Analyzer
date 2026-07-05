import { Router } from 'express';
import authRoutes from './authRoutes';
import resumeRoutes from './resumeRoutes';
import jobRoutes from './jobRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);

export default router;
