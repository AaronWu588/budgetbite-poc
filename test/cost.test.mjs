import { test } from "node:test";
import assert from "node:assert/strict";
import { toGrams } from "../lib/units.js";
import { priceIngredients, costSummary } from "../lib/cost.js";

test("converts cups of rice to grams", () => {
  assert.equal(toGrams("white rice", 1, "cup"), 185);
});

test("converts mass units directly", () => {
  assert.equal(toGrams("anything", 2, "kg"), 2000);
});

test("rice example from the proposal: 185 g of a $1.79 / 907 g bag is about $0.37", () => {
  const [rice] = priceIngredients([{ name: "white rice", quantity: 1, unit: "cup" }]);
  assert.equal(Math.round(rice.cost * 100) / 100, 0.37);
});

test("cost per serving divides the total by servings", () => {
  const priced = priceIngredients([
    { name: "white rice", quantity: 1, unit: "cup" },
    { name: "chickpeas, canned", quantity: 1, unit: "can" },
  ]);
  const summary = costSummary(priced, 2, 3.0);
  assert.equal(summary.totalCost, 1.36);
  assert.equal(summary.costPerServing, 0.68);
  assert.equal(summary.withinBudget, true);
  assert.equal(summary.overBy, 0);
});

test("flags a recipe that is over budget and by how much", () => {
  const priced = priceIngredients([{ name: "olive oil", quantity: 16, unit: "tbsp" }]);
  const summary = costSummary(priced, 1, 1.0);
  assert.equal(summary.withinBudget, false);
  assert.ok(summary.overBy > 0);
});

test("upfront cost skips items already owned", () => {
  const priced = priceIngredients([
    { name: "white rice", quantity: 1, unit: "cup", alreadyOwned: true },
    { name: "chickpeas, canned", quantity: 1, unit: "can" },
  ]);
  assert.equal(costSummary(priced, 2, 3.0).upfrontCost, 0.99);
});
