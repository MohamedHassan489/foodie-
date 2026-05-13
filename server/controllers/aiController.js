import prisma from '../config/db.js';
import { generateRecipe, scanFridge, generateMealPlan, getCookingTip } from '../services/claude.js';

export async function generateFromIngredients(req, res) {
  try {
    const { ingredients } = req.body;
    if (!ingredients?.length) {
      return res.status(400).json({ error: 'At least one ingredient is required' });
    }

    const user   = await prisma.user.findUnique({ where: { id: req.user.id } });
    const recipe = await generateRecipe(ingredients, user);
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function analyzeFridgeImage(req, res) {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Base64 image is required' });

    const base64      = image.replace(/^data:image\/\w+;base64,/, '');
    const ingredients = await scanFridge(base64);
    res.json({ ingredients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createMealPlan(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const plan = await generateMealPlan(user);

    const saved = await prisma.mealPlan.create({
      data: {
        userId: req.user.id,
        week:   new Date().toISOString().split('T')[0],
        meals:  JSON.stringify(plan),
      },
    });

    res.json({ id: saved.id, createdAt: saved.createdAt, ...plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function stepTip(req, res) {
  try {
    const { recipe, step } = req.body;
    if (!recipe || !step) return res.status(400).json({ error: 'recipe and step are required' });

    const tip = await getCookingTip(recipe, step);
    res.json({ tip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
