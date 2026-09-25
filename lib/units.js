// Converts recipe quantities into grams.
//
// Mass units convert directly. Volume and count units ("1 cup", "1 can")
// depend on the food, so they use a gram weight per unit. In the full project
// these weights come from the portion data USDA FoodData Central publishes for
// each food; here they're hardcoded for the PoC ingredients.

const MASS_UNITS = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 };

const PORTION_GRAMS = {
  "white rice": { cup: 185 },
  "chickpeas, canned": { can: 439 },
  "olive oil": { tbsp: 13.5, tsp: 4.5 },
  "ground cumin": { tsp: 2.1, tbsp: 6.3 },
  "frozen mixed vegetables": { cup: 134 },
};

export function toGrams(name, quantity, unit) {
  if (MASS_UNITS[unit]) return quantity * MASS_UNITS[unit];
  const grams = PORTION_GRAMS[name]?.[unit];
  if (grams === undefined) {
    throw new Error(`No gram weight for "${unit}" of ${name}`);
  }
  return quantity * grams;
}
