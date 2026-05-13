import prisma from '../config/db.js';

const SAFE_FIELDS = { id: true, email: true, name: true, diet: true, allergies: true, skillLevel: true, createdAt: true };

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: SAFE_FIELDS,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recipeCount = await prisma.recipe.count({ where: { userId: req.user.id } });
    res.json({ ...user, recipeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, diet, allergies, skillLevel } = req.body;

    const user = await prisma.user.update({
      where:  { id: req.user.id },
      data:   { name, diet, allergies, skillLevel },
      select: SAFE_FIELDS,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMealPlans(req, res) {
  try {
    const plans = await prisma.mealPlan.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    10,
    });

    res.json(plans.map(p => ({ ...p, meals: JSON.parse(p.meals) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
