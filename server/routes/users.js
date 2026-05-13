import { Router } from 'express';
import { getProfile, updateProfile, getMealPlans } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/profile',    getProfile);
router.put('/profile',    updateProfile);
router.get('/meal-plans', getMealPlans);

export default router;
