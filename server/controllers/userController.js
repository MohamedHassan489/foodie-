import { z } from 'zod';
import prisma from '../config/db.js';

const SAFE = { id: true, email: true, name: true, diet: true, allergies: true, skillLevel: true, createdAt: true };

const profileSchema = z.object({
  name:       z.string().min(1).max(50).optional(),
  diet:       z.enum(['none','vegetarian','vegan','keto','paleo','gluten-free','dairy-free']).optional(),
  allergies:  z.string().max(200).optional(),
  skillLevel: z.enum(['beginner','intermediate','advanced','professional']).optional(),
});

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: SAFE });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const recipeCount = await prisma.recipe.count({ where: { userId: req.user.id } });
    res.json({ ...user, recipeCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateProfile(req, res) {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: parsed.data, select: SAFE });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getMealPlans(req, res) {
  try {
    const plans = await prisma.mealPlan.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 10,
    });
    res.json(plans.map(p => ({ ...p, meals: JSON.parse(p.meals) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
}
