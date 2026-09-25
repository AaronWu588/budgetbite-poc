import { NextResponse } from "next/server";
import { priceIngredients, costSummary } from "../../../lib/cost.js";
import { lookupNutrition, macrosPerServing } from "../../../lib/nutrition.js";

/**
 * POST /api/recipe
 * Body: { budget: string | number, diet: string }
 *
 * What's real in this PoC:
 *   - Cost per serving is calculated from ingredient prices (lib/cost.js),
 *     not guessed. Prices come from a hardcoded table (lib/prices.js).
 *   - Macros are calculated from USDA FoodData Central nutrition data
 *     (lib/nutrition.js), with offline fallback values if the call fails.
 *   - The budget check compares cost per serving to the user's budget.
 *
 * What's still mocked:
 *   - The recipe itself. In the full project it comes from the OpenAI API as
 *     structured JSON (same shape as RECIPE below), roughly like this:
 *
 *   const completion = await fetch("https://api.openai.com/v1/chat/completions", {
 *     method: "POST",
 *     headers: {
 *       "Content-Type": "application/json",
 *       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
 *     },
 *     body: JSON.stringify({
 *       model: "gpt-4o-mini",
 *       messages: [
 *         { role: "system", content: "You are a budget-cooking assistant. Reply only with JSON." },
 *         { role: "user", content: `Give me a ${diet} recipe for under $${budget} per serving.` },
 *       ],
 *       response_format: { type: "json_schema", json_schema: RECIPE_SCHEMA },
 *     }),
 *   });
 *
 *   - Over-budget handling. Right now the response just flags it; the full
 *     project swaps in cheaper ingredients and asks the model for a revision.
 */

const DIETS = ["high-protein", "low-carb", "vegetarian"];

// The recipe the LLM will eventually generate. Quantities are structured
// (quantity + unit) so they can be converted to grams and priced.
const RECIPE = {
  title: "One-Pan Chickpea & Rice Bowl",
  description: "A cheap vegetarian bowl made from pantry staples.",
  servings: 2,
  ingredients: [
    { name: "white rice", quantity: 1, unit: "cup", usdaQuery: "rice white long-grain raw" },
    {
      name: "chickpeas, canned",
      quantity: 1,
      unit: "can",
      usdaQuery: "chickpeas canned drained",
      // A 15.5 oz can is priced by the whole can, but only the ~250 g of
      // drained chickpeas count toward macros.
      nutritionGrams: 250,
    },
    { name: "olive oil", quantity: 1, unit: "tbsp", usdaQuery: "olive oil" },
    { name: "ground cumin", quantity: 1, unit: "tsp", usdaQuery: "spices cumin seed" },
    { name: "frozen mixed vegetables", quantity: 0.5, unit: "cup", usdaQuery: "mixed vegetables frozen" },
  ],
  steps: [
    "Cook the rice according to the package directions.",
    "Warm the olive oil in a pan, add the cumin, then the drained chickpeas and frozen vegetables.",
    "Cook for 5 to 7 minutes until heated through, season with salt and pepper, and serve over the rice.",
  ],
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const budget = Number(body.budget);
  if (!Number.isFinite(budget) || budget <= 0) {
    return NextResponse.json({ error: "Budget must be a positive number." }, { status: 400 });
  }
  if (!DIETS.includes(body.diet)) {
    return NextResponse.json({ error: `Diet must be one of: ${DIETS.join(", ")}` }, { status: 400 });
  }

  // 1. price every ingredient
  const priced = priceIngredients(RECIPE.ingredients);

  // 2. look up nutrition for every ingredient in parallel
  const nutrition = await Promise.all(
    priced.map((ing) => lookupNutrition(ing.name, ing.usdaQuery))
  );
  const ingredients = priced.map((ing, i) => ({ ...ing, nutrition: nutrition[i] }));

  // 3. compute cost, budget status, and macros
  const cost = costSummary(ingredients, RECIPE.servings, budget);
  const macros = macrosPerServing(ingredients, RECIPE.servings);

  return NextResponse.json({
    title: RECIPE.title,
    description: RECIPE.description,
    servings: RECIPE.servings,
    steps: RECIPE.steps,
    budget,
    diet: body.diet,
    ...cost,
    macros,
    ingredients: ingredients.map((ing) => ({
      text: `${ing.quantity} ${ing.unit} ${ing.name}`,
      grams: Math.round(ing.grams),
      cost: ing.cost === null ? null : Math.round(ing.cost * 100) / 100,
      priceSource: ing.priceSource,
      nutritionSource: ing.nutrition.source,
      usdaMatch: ing.nutrition.usdaMatch,
    })),
  });
}
