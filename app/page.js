"use client";

import { useState } from "react";

export default function Home() {
  const [budget, setBudget] = useState("10");
  const [diet, setDiet] = useState("high-protein");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getRecipe(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget, diet }),
    });
    const data = await res.json();
    setRecipe(data);
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

      {recipe && (
        <section style={{ marginTop: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
          <h2>{recipe.title}</h2>
          <p>{recipe.description}</p>
          <p><strong>Estimated cost:</strong> ${recipe.estimatedCost}</p>

          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>

          <h3>Macros (per serving)</h3>
          <ul>
            <li>Calories: {recipe.macros.calories}</li>
            <li>Protein: {recipe.macros.protein_g} g</li>
            <li>Carbs: {recipe.macros.carbs_g} g</li>
            <li>Fat: {recipe.macros.fat_g} g</li>
          </ul>
        </section>
      )}
    </main>
  );
}
