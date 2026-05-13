import prisma from '../config/db.js';

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
    const { cuisine, difficulty, favorites } = req.query;
    const where = { userId: req.user.id };
    if (cuisine)    where.cuisine    = cuisine;
    if (difficulty) where.difficulty = difficulty;
    if (favorites === 'true') where.isFavorite = true;

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(recipes.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRecipe(req, res) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(parse(recipe));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveRecipe(req, res) {
  try {
    const { title, time, servings, cuisine, difficulty, ingredients, steps, nutrition, tip } = req.body;

    if (!title || !ingredients?.length || !steps?.length) {
      return res.status(400).json({ error: 'title, ingredients, and steps are required' });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        time:        Number(time) || 30,
        servings:    Number(servings) || 2,
        cuisine:     cuisine     || 'international',
        difficulty:  difficulty  || 'easy',
        ingredients: JSON.stringify(ingredients),
        steps:       JSON.stringify(steps),
        nutrition:   JSON.stringify(nutrition || {}),
        tip:         tip || '',
        userId:      req.user.id,
      },
    });

    res.status(201).json(parse(recipe));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.recipe.update({
      where: { id: req.params.id },
      data:  { isFavorite: !recipe.isFavorite },
    });

    res.json(parse(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteRecipe(req, res) {
  try {
    await prisma.recipe.delete({ where: { id: req.params.id } });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
