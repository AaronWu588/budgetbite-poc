# BudgetBite — Proof of Concept

Cheap, tasty recipes with listed macros. This is a minimal proof of
concept showing the core pipeline: a form collects a budget and
dietary goal, sends it to an API route, and displays the returned
recipe with its macros.

The `/api/recipe` route currently returns hardcoded data so the whole
request/response flow can be demonstrated without an API key. See the
comments in `app/api/recipe/route.js` for exactly how this will be
replaced with a real OpenAI API call (for the recipe) and a USDA
FoodData Central API call (for macro lookups) in the full project.

## Environment used to build/test this

- **OS:** Ubuntu 24.04 (Linux)
- **Node.js:** v22.22.2
- **npm:** 10.9.7
- **Next.js:** 16.3.5

## How to compile and run

```bash
npm install
npm run build   # compiles the app
npm run start   # runs the compiled app at http://localhost:3000
```

For local development with hot-reload instead:

```bash
npm install
npm run dev      # runs at http://localhost:3000
```

Open http://localhost:3000, pick a budget and dietary goal, and click
"Get a recipe" to see the mocked recipe and macros returned by the API
route.
