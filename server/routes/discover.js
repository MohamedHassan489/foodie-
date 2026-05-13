import { Router } from 'express';
import { searchRecipes, getCategories, getByCategory } from '../controllers/discoverController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/',            searchRecipes);
router.get('/categories',  getCategories);
router.get('/category/:c', getByCategory);

export default router;
