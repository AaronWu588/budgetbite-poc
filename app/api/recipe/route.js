import { NextResponse } from "next/server";

/**
 * POST /api/recipe
 * Body: { budget: string, diet: string }
 *
 * PROOF-OF-CONCEPT NOTE:
 * This route currently returns a hardcoded recipe so the whole
 * request/response pipeline (form -> API route -> JSON -> UI) can be
 * demonstrated without requiring live API keys.
 *
 * In the full project, this handler will instead:
 *   1. Call an LLM API (e.g. OpenAI's Chat Completions endpoint) with a
 *      prompt built from `budget` and `diet`, asking for a cheap recipe
 *      that fits the budget and dietary goal.
 *   2. Take the ingredient list the model returns and look up nutrition
 *      data for each ingredient via the USDA FoodData Central API
 *      (https://fdc.nal.usda.gov/api-guide.html), which is free and
 *      requires only a signup API key.
 *   3. Sum the per-ingredient macros into the per-serving totals shown
 *      in the "macros" object below, and estimate the cost per serving
 *      from grocery price data.
 *
 * Example of what step 1 will look like (left commented out since it
 * needs an API key to run):
 *
 * const completion = await fetch("https://api.openai.com/v1/chat/completions", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
 *   },
 *   body: JSON.stringify({
 *     model: "gpt-4o-mini",
 *     messages: [
 *       { role: "system", content: "You are a budget-cooking assistant." },
 *       { role: "user", content: `Give me a ${diet} recipe for under $${budget} per serving.` },
 *     ],
 *   }),
 * });
 */
export async function POST(request) {
  const { budget, diet } = await request.json();

  const mockRecipe = {
    title: "One-Pan Chickpea & Rice Bowl",
    description: `A ${diet} recipe built to fit a $${budget} per-serving budget, using pantry staples.`,
    estimatedCost: Math.min(Number(budget) || 8, 8).toFixed(2),
    ingredients: [
      "1 cup white rice",
      "1 can chickpeas, drained",
      "1 tbsp olive oil",
      "1 tsp cumin",
      "1/2 cup frozen mixed vegetables",
      "Salt and pepper to taste",
    ],
    macros: {
      calories: 520,
      protein_g: 18,
      carbs_g: 82,
      fat_g: 12,
    },
  };

  return NextResponse.json(mockRecipe);
}
