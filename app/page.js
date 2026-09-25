"use client";

import { useState } from "react";

const money = (n) => `$${Number(n).toFixed(2)}`;

export default function Home() {
  const [budget, setBudget] = useState("3");
  const [diet, setDiet] = useState("vegetarian");
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getRecipe(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, diet }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setRecipe(null);
      } else {
        setRecipe(data);
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  }

  return (
    <main>
      <h1>BudgetBite</h1>
      <p>Cheap, tasty recipes with listed macros. (Proof of concept)</p>

      <form onSubmit={getRecipe} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Budget per serving ($)
          <input
            type="number"
            min="0.5"
            step="0.25"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <label>
          Dietary goal
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            style={{ display: "block", width: "100%" }}
          >
            <option value="high-protein">High protein</option>
            <option value="low-carb">Low carb</option>
            <option value="vegetarian">Vegetarian</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Finding a recipe..." : "Get a recipe"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {recipe && (
        <section style={{ marginTop: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
          <h2>{recipe.title}</h2>
          <p>{recipe.description} Serves {recipe.servings}.</p>

          <p
            style={{
              padding: 8,
              borderRadius: 6,
              background: recipe.withinBudget ? "#e8f5e9" : "#fdecea",
            }}
          >
            <strong>Cost per serving:</strong> {money(recipe.costPerServing)}{" "}
            {recipe.withinBudget
              ? `(within your ${money(recipe.budget)} budget)`
              : `(over your ${money(recipe.budget)} budget by ${money(recipe.overBy)})`}
            <br />
            <strong>Upfront shopping cost:</strong> {money(recipe.upfrontCost)} (full packages)
          </p>

          <h3>Ingredients</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th>Ingredient</th>
                <th>Grams</th>
                <th>Cost</th>
                <th>Nutrition data</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{ing.text}</td>
                  <td>{ing.grams}</td>
                  <td>{ing.cost === null ? "n/a" : money(ing.cost)}</td>
                  <td title={ing.usdaMatch || "USDA call failed, using offline values"}>
                    {ing.nutritionSource === "USDA" ? "USDA" : "offline"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "#666" }}>
            Prices are from a sample price table. Hover over a nutrition source to see the USDA food it matched.
          </p>

          <h3>Macros (per serving)</h3>
          <ul>
            <li>Calories: {recipe.macros.calories}</li>
            <li>Protein: {recipe.macros.protein_g} g</li>
            <li>Carbs: {recipe.macros.carbs_g} g</li>
            <li>Fat: {recipe.macros.fat_g} g</li>
          </ul>

          <h3>Steps</h3>
          <ol>
            {recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
