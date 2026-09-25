// Cost-per-serving math.
//
// Uses the "amount used" method: each ingredient costs
//   grams used x (package price / package grams)
// and cost per serving is the total divided by the number of servings.
// Budget is checked against cost per serving.
//
// Upfront shopping cost is separate: the full price of every package you'd
// have to buy, skipping anything already in your pantry.

import { quote } from "./prices.js";
import { toGrams } from "./units.js";

const round2 = (n) => Math.round(n * 100) / 100;

export function priceIngredients(ingredients) {
  return ingredients.map((ing) => {
    const grams = toGrams(ing.name, ing.quantity, ing.unit);
    const q = quote(ing.name);
    if (!q) {
      return { ...ing, grams, cost: null, priceSource: "NO_PRICE" };
    }
    return {
      ...ing,
      grams,
      cost: grams * q.pricePerGram,
      packagePrice: q.packagePrice,
      productName: q.productName,
      priceSource: q.source,
    };
  });
}

export function costSummary(pricedIngredients, servings, budgetPerServing) {
  const total = pricedIngredients.reduce((sum, i) => sum + (i.cost ?? 0), 0);
  const costPerServing = round2(total / servings);
  const upfrontCost = pricedIngredients
    .filter((i) => !i.alreadyOwned && i.packagePrice !== undefined)
    .reduce((sum, i) => sum + i.packagePrice, 0);

  const withinBudget = costPerServing <= budgetPerServing;
  return {
    totalCost: round2(total),
    costPerServing,
    upfrontCost: round2(upfrontCost),
    withinBudget,
    overBy: withinBudget ? 0 : round2(costPerServing - budgetPerServing),
  };
}
