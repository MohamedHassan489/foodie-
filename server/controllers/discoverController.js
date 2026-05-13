const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

function normalizeMeal(m) {
  if (!m) return null;

  // Build ingredients list from up to 20 ingredient/measure pairs
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (m[`strIngredient${i}`] || '').trim();
    const msr = (m[`strMeasure${i}`]    || '').trim();
    if (ing) ingredients.push(msr ? `${msr} ${ing}` : ing);
  }

  // Split instructions into step array
  const steps = (m.strInstructions || '')
    .split(/\r?\n+/)
    .map(s => s.replace(/^STEP\s*\d+[.\s]*/i, '').trim())
    .filter(Boolean);

  return {
    externalId:  m.idMeal,
    title:       m.strMeal,
    cuisine:     (m.strArea || 'international').toLowerCase(),
    category:    m.strCategory || '',
    thumb:       m.strMealThumb || '',
    time:        30,
    servings:    4,
    difficulty:  'medium',
    ingredients,
    steps,
    nutrition:   {},
    tip:         '',
    notes:       '',
    source:      'themealdb',
  };
}

async function mealdbFetch(path) {
  const res = await fetch(`${MEALDB}${path}`);
  if (!res.ok) throw new Error('TheMealDB request failed');
  return res.json();
}

export async function searchRecipes(req, res) {
  const { q = '', category = '' } = req.query;
  try {
    let meals = [];

    if (q) {
      const data = await mealdbFetch(`/search.php?s=${encodeURIComponent(q)}`);
      meals = data.meals || [];
    } else if (category) {
      // filter endpoint only returns partial data — fetch full for first 12
      const data = await mealdbFetch(`/filter.php?c=${encodeURIComponent(category)}`);
      const ids  = (data.meals || []).slice(0, 12).map(m => m.idMeal);
      meals = await Promise.all(ids.map(async id => {
        const d = await mealdbFetch(`/lookup.php?i=${id}`);
        return d.meals?.[0] ?? null;
      }));
      meals = meals.filter(Boolean);
    } else {
      // Default: show meals from a few popular categories
      const popular = ['Chicken', 'Pasta', 'Seafood', 'Beef'];
      const picked = popular[Math.floor(Math.random() * popular.length)];
      const data = await mealdbFetch(`/filter.php?c=${picked}`);
      const ids  = (data.meals || []).slice(0, 12).map(m => m.idMeal);
      meals = await Promise.all(ids.map(async id => {
        const d = await mealdbFetch(`/lookup.php?i=${id}`);
        return d.meals?.[0] ?? null;
      }));
      meals = meals.filter(Boolean);
    }

    res.json({ results: meals.map(normalizeMeal).filter(Boolean) });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach recipe database: ' + err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const data = await mealdbFetch('/categories.php');
    const cats = (data.categories || []).map(c => ({
      name:  c.strCategory,
      thumb: c.strCategoryThumb,
      desc:  c.strCategoryDescription?.slice(0, 120),
    }));
    res.json({ categories: cats });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

export async function getByCategory(req, res) {
  req.query.category = req.params.c;
  return searchRecipes(req, res);
}
