import { Router } from 'express';
import { uploadResume, getResumeHistory, getResumeDetails, deleteResume, reanalyzeResume } from '../controllers/resumeController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume);
router.get('/history', authMiddleware, getResumeHistory);
router.get('/:id', authMiddleware, getResumeDetails);
router.delete('/:id', authMiddleware, deleteResume);
router.post('/:id/reanalyze', authMiddleware, reanalyzeResume);

export default router;
