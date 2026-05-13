import { z } from 'zod';
import prisma from '../config/db.js';

const saveSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(120),
  time:        z.coerce.number().int().min(1).optional().default(30),
  servings:    z.coerce.number().int().min(1).optional().default(2),
  cuisine:     z.string().optional().default('international'),
  difficulty:  z.enum(['easy','medium','hard']).optional().default('easy'),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient required'),
  steps:       z.array(z.string().min(1)).min(1, 'At least one step required'),
  nutrition:   z.record(z.any()).optional().default({}),
  tip:         z.string().optional().default(''),
});

function parse(recipe) {
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients),
    steps:       JSON.parse(recipe.steps),
    nutrition:   JSON.parse(recipe.nutrition),
  };
}

export async function getRecipes(req, res) {
  try {
    const { cuisine, difficulty, favorites, page = 1, limit = 12 } = req.query;
    const where = { userId: req.user.id };
    if (cuisine)              where.cuisine    = cuisine;
    if (difficulty)           where.difficulty = difficulty;
    if (favorites === 'true') where.isFavorite = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.recipe.count({ where }),
    ]);

    res.json({ recipes: recipes.map(parse), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getRecipe(req, res) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(parse(recipe));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function saveRecipe(req, res) {
  const parsed = saveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const { title, time, servings, cuisine, difficulty, ingredients, steps, nutrition, tip } = parsed.data;
    const recipe = await prisma.recipe.create({
      data: {
        title, time, servings, cuisine, difficulty, tip,
        ingredients: JSON.stringify(ingredients),
        steps:       JSON.stringify(steps),
        nutrition:   JSON.stringify(nutrition),
        userId:      req.user.id,
      },
    });
    res.status(201).json(parse(recipe));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function toggleFavorite(req, res) {
  try {
    const recipe  = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.recipe.update({ where: { id: req.params.id }, data: { isFavorite: !recipe.isFavorite } });
    res.json(parse(updated));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function rateRecipe(req, res) {
  const rating = parseFloat(req.body.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  try {
    const updated = await prisma.recipe.update({ where: { id: req.params.id }, data: { rating } });
    res.json(parse(updated));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateNotes(req, res) {
  const notes = typeof req.body.notes === 'string' ? req.body.notes.slice(0, 2000) : '';
  try {
    const updated = await prisma.recipe.update({ where: { id: req.params.id }, data: { notes } });
    res.json(parse(updated));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteRecipe(req, res) {
  try {
    await prisma.recipe.delete({ where: { id: req.params.id } });
    res.json({ message: 'Recipe deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
