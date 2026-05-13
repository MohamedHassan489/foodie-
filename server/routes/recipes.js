import { Router } from 'express';
import { getRecipes, getRecipe, saveRecipe, toggleFavorite, deleteRecipe } from '../controllers/recipeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/',              getRecipes);
router.get('/:id',           getRecipe);
router.post('/',             saveRecipe);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id',        deleteRecipe);

export default router;
