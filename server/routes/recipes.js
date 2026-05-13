import { Router } from 'express';
import { getRecipes, getRecipe, saveRecipe, toggleFavorite, rateRecipe, updateNotes, deleteRecipe } from '../controllers/recipeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/',                  getRecipes);
router.get('/:id',               getRecipe);
router.post('/',                 saveRecipe);
router.patch('/:id/favorite',    toggleFavorite);
router.patch('/:id/rating',      rateRecipe);
router.patch('/:id/notes',       updateNotes);
router.delete('/:id',            deleteRecipe);

export default router;
