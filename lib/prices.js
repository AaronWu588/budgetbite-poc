// Ingredient price table for the proof of concept.
//
// In the full project this table is built from BLS Average Price Data and
// USDA ERS produce prices (regional averages), and live Kroger prices are
// used when there's a Kroger-family store near the user. For the PoC the
// prices are hardcoded so the cost math can be demonstrated without any keys.
// Prices are illustrative, roughly what a discount grocery store charges.

export const PRICE_TABLE = {
  "white rice": {
    productName: "long-grain white rice, 2 lb bag",
    packagePrice: 1.79,
    packageGrams: 907,
    source: "REGIONAL_AVERAGE",
  },
  "chickpeas, canned": {
    productName: "chickpeas, 15.5 oz can",
    packagePrice: 0.99,
    packageGrams: 439,
    source: "REGIONAL_AVERAGE",
  },
  "olive oil": {
    productName: "olive oil, 16.9 fl oz bottle",
    packagePrice: 7.99,
    packageGrams: 458,
    source: "REGIONAL_AVERAGE",
  },
  "ground cumin": {
    productName: "ground cumin, 1.5 oz jar",
    packagePrice: 2.49,
    packageGrams: 42,
    source: "REGIONAL_AVERAGE",
  },
  "frozen mixed vegetables": {
    productName: "frozen mixed vegetables, 12 oz bag",
    packagePrice: 1.29,
    packageGrams: 340,
    source: "REGIONAL_AVERAGE",
  },
};

// Returns a price quote for an ingredient, or null if we don't have a price.
export function quote(name) {
  const entry = PRICE_TABLE[name];
  if (!entry) return null;
  return { ...entry, pricePerGram: entry.packagePrice / entry.packageGrams };
}
