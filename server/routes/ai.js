import { Router } from 'express';
import { generateFromIngredients, analyzeFridgeImage, createMealPlan, stepTip } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.post('/generate',  generateFromIngredients);
router.post('/scan',      analyzeFridgeImage);
router.post('/meal-plan', createMealPlan);
router.post('/tip',       stepTip);

export default router;
