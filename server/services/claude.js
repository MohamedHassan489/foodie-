import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RECIPE_SYSTEM = 'You are a professional chef AI. Respond ONLY with valid JSON — no markdown fences, no extra text.';

const recipePrompt = (ingredients, { diet = 'none', allergies = '', skillLevel = 'intermediate', name = 'Chef' } = {}) =>
  `Create a recipe for ${name} using: ${ingredients.join(', ')}.
Diet: ${diet}. Allergies: ${allergies || 'none'}. Skill level: ${skillLevel}.

Return this exact JSON shape:
{
  "title": "string",
  "time": number,
  "servings": number,
  "cuisine": "string",
  "difficulty": "easy|medium|hard",
  "ingredients": ["string"],
  "steps": ["string"],
  "nutrition": { "calories": number, "protein": "string", "carbs": "string", "fat": "string" },
  "tip": "string"
}`;

// ── Safe JSON extractor ───────────────────────────────────────────────────────
function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('Could not parse recipe from AI response');
}

// ── Recipe generation (standard) ─────────────────────────────────────────────
export async function generateRecipe(ingredients, userProfile = {}) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: RECIPE_SYSTEM,
    messages: [{ role: 'user', content: recipePrompt(ingredients, userProfile) }],
  });
  return extractJSON(response.content[0].text);
}

// ── Recipe generation (streaming) ────────────────────────────────────────────
export async function* streamRecipe(ingredients, userProfile = {}) {
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: RECIPE_SYSTEM,
    messages: [{ role: 'user', content: recipePrompt(ingredients, userProfile) }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

// ── Fridge image analysis (vision) ───────────────────────────────────────────
export async function scanFridge(base64Image) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
        { type: 'text', text: 'Identify all visible food ingredients. Return ONLY a JSON array of short ingredient names, no markdown: ["ingredient1", "ingredient2"]' },
      ],
    }],
  });
  return extractJSON(response.content[0].text);
}

// ── Weekly meal plan ──────────────────────────────────────────────────────────
export async function generateMealPlan(userProfile = {}) {
  const { diet = 'none', allergies = '', skillLevel = 'intermediate' } = userProfile;
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: 'You are a nutritionist AI. Respond ONLY with valid JSON — no markdown fences, no extra text.',
    messages: [{
      role: 'user',
      content: `Create a 7-day meal plan.
Diet: ${diet}. Allergies: ${allergies || 'none'}. Skill: ${skillLevel}.

Return this exact JSON shape:
{
  "days": [{ "day": "string", "breakfast": { "title": "string", "time": number }, "lunch": { "title": "string", "time": number }, "dinner": { "title": "string", "time": number } }],
  "shoppingList": ["string"],
  "totalCalories": number
}`,
    }],
  });
  return extractJSON(response.content[0].text);
}

// ── Per-step cooking tip ──────────────────────────────────────────────────────
export async function getCookingTip(recipeName, step) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: `Give one concise pro tip for this step in "${recipeName}": "${step}". Max 2 sentences, no bullet points.` }],
  });
  return response.content[0].text.trim();
}

// ── Ingredient substitution ───────────────────────────────────────────────────
export async function substituteIngredient(ingredient, recipeName) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 160,
    messages: [{
      role: 'user',
      content: `Give 2-3 substitutes for "${ingredient}" in ${recipeName || 'this recipe'}. One line per substitute, no intro text, no numbers.`,
    }],
  });
  return response.content[0].text.trim();
}
