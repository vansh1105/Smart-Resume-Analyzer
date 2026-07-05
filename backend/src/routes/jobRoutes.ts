import { Router } from 'express';
import { matchJobDescription, getJobMatchHistory, deleteJobMatch } from '../controllers/jobController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/match', authMiddleware, matchJobDescription);
router.get('/history/:resumeId', authMiddleware, getJobMatchHistory);
router.delete('/:id', authMiddleware, deleteJobMatch);

export default router;
