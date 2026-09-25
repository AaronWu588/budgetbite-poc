// Nutrition lookups from the USDA FoodData Central API.
// API guide: https://fdc.nal.usda.gov/api-guide.html
//
// Uses USDA_API_KEY from the environment, or the public DEMO_KEY (which has a
// low rate limit). If the request fails for any reason, it falls back to
// approximate values stored below so the app still runs offline. The response
// says which source was used for every ingredient.

const FDC_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

// USDA nutrient IDs
const ENERGY_KCAL = [1008, 2048, 2047]; // Foundation foods sometimes only have the Atwater values
const PROTEIN = 1003;
const FAT = 1004;
const CARBS = 1005;

// Approximate per-100 g values, only used when the USDA call fails.
const FALLBACK = {
  "white rice": { calories: 365, protein: 7.1, carbs: 80.0, fat: 0.7 },
  "chickpeas, canned": { calories: 139, protein: 7.0, carbs: 22.5, fat: 2.5 },
  "olive oil": { calories: 884, protein: 0, carbs: 0, fat: 100 },
  "ground cumin": { calories: 375, protein: 17.8, carbs: 44.2, fat: 22.3 },
  "frozen mixed vegetables": { calories: 72, protein: 3.3, carbs: 13.5, fat: 0.5 },
};

const cache = new Map();

function nutrientValue(food, ids) {
  for (const id of [].concat(ids)) {
    const n = food.foodNutrients?.find((x) => x.nutrientId === id);
    if (n && typeof n.value === "number") return n.value;
  }
  return 0;
}

export async function lookupNutrition(name, usdaQuery) {
  if (cache.has(name)) return cache.get(name);

  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
  const params = new URLSearchParams({
    api_key: apiKey,
    query: usdaQuery || name,
    dataType: "Foundation,SR Legacy", // generic foods, not branded products
    pageSize: "1",
  });

  let result;
  try {
    const res = await fetch(`${FDC_URL}?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`USDA returned ${res.status}`);
    const data = await res.json();
    const food = data.foods?.[0];
    if (!food) throw new Error("no USDA match");

    result = {
      per100g: {
        calories: nutrientValue(food, ENERGY_KCAL),
        protein: nutrientValue(food, PROTEIN),
        carbs: nutrientValue(food, CARBS),
        fat: nutrientValue(food, FAT),
      },
      source: "USDA",
      usdaMatch: `${food.description} (fdcId ${food.fdcId})`,
    };
  } catch (err) {
    result = {
      per100g: FALLBACK[name] ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
      source: "FALLBACK",
      usdaMatch: null,
      error: err.message,
    };
  }

  // only cache real USDA results so a failed call gets retried next time
  if (result.source === "USDA") cache.set(name, result);
  return result;
}

// Adds up macros for a list of { grams (or nutritionGrams), nutrition } items.
export function macrosPerServing(items, servings) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const item of items) {
    const grams = item.nutritionGrams ?? item.grams;
    for (const key of Object.keys(total)) {
      total[key] += (item.nutrition.per100g[key] * grams) / 100;
    }
  }
  return {
    calories: Math.round(total.calories / servings),
    protein_g: Math.round(total.protein / servings),
    carbs_g: Math.round(total.carbs / servings),
    fat_g: Math.round(total.fat / servings),
  };
}
