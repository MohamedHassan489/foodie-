import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Recipe generation from text ingredients ──────────────────────────────────
export async function generateRecipe(ingredients, userProfile = {}) {
  const { diet = 'none', allergies = '', skillLevel = 'intermediate', name = 'Chef' } = userProfile;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: 'You are a professional chef AI. Respond ONLY with valid JSON — no markdown fences, no extra text.',
    messages: [{
      role: 'user',
      content: `Create a recipe for ${name} using: ${ingredients.join(', ')}.
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
}`,
    }],
  });

  return JSON.parse(response.content[0].text);
}

// ── Fridge image analysis (vision) ───────────────────────────────────────────
export async function scanFridge(base64Image) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
        },
        {
          type: 'text',
          text: 'Identify all visible food ingredients in this image. Return ONLY a JSON array of short ingredient names, no markdown: ["ingredient1", "ingredient2"]',
        },
      ],
    }],
  });

  return JSON.parse(response.content[0].text);
}

// ── Weekly meal plan generator ────────────────────────────────────────────────
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
  "days": [
    {
      "day": "Monday",
      "breakfast": { "title": "string", "time": number },
      "lunch":     { "title": "string", "time": number },
      "dinner":    { "title": "string", "time": number }
    }
  ],
  "shoppingList": ["string"],
  "totalCalories": number
}`,
    }],
  });

  return JSON.parse(response.content[0].text);
}

// ── Inline cooking tip for a single step ─────────────────────────────────────
export async function getCookingTip(recipeName, step) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Give one concise pro tip for this step in "${recipeName}": "${step}". Max 2 sentences, no bullet points.`,
    }],
  });

  return response.content[0].text.trim();
}
