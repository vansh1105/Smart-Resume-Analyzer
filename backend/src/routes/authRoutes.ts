import { Router } from 'express';
import { registerUser, loginUser, getProfile, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);

export default router;
