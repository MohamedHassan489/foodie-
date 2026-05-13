import { z } from 'zod';
import prisma from '../config/db.js';
import { generateRecipe, scanFridge, generateMealPlan, getCookingTip } from '../services/claude.js';

function checkApiKey(res) {
  const key = process.env.ANTHROPIC_API_KEY || '';
  if (!key || key.startsWith('sk-ant-xxx')) {
    res.status(503).json({ error: 'AI features require an Anthropic API key. Add ANTHROPIC_API_KEY to your .env file.' });
    return false;
  }
  return true;
}

const generateSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient required').max(30),
});

const scanSchema = z.object({
  image: z.string().min(1, 'Image is required'),
});

const tipSchema = z.object({
  recipe: z.string().min(1),
  step:   z.string().min(1),
});

export async function generateFromIngredients(req, res) {
  if (!checkApiKey(res)) return;
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const user   = await prisma.user.findUnique({ where: { id: req.user.id } });
    const recipe = await generateRecipe(parsed.data.ingredients, user);
    res.json(recipe);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function analyzeFridgeImage(req, res) {
  if (!checkApiKey(res)) return;
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const base64     = parsed.data.image.replace(/^data:image\/\w+;base64,/, '');
    const ingredients = await scanFridge(base64);
    res.json({ ingredients });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function createMealPlan(req, res) {
  if (!checkApiKey(res)) return;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const plan = await generateMealPlan(user);
    const saved = await prisma.mealPlan.create({
      data: { userId: req.user.id, week: new Date().toISOString().split('T')[0], meals: JSON.stringify(plan) },
    });
    res.json({ id: saved.id, createdAt: saved.createdAt, ...plan });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function stepTip(req, res) {
  if (!checkApiKey(res)) return;
  const parsed = tipSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const tip = await getCookingTip(parsed.data.recipe, parsed.data.step);
    res.json({ tip });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
