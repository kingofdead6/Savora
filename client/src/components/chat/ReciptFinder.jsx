// src/RecipeFinder.jsx
import { useState } from 'react';
import { NODE_API } from "../../../api.js";

const commonIngredients = [
  "tomato", "potato", "onion", "carrot", "zucchini", "eggplant", "bell pepper", "cucumber",
  "lettuce", "spinach", "broccoli", "cauliflower", "cabbage", "garlic", "apple", "banana",
  "orange", "lemon", "strawberry", "mango", "rice", "pasta", "eggs", "chicken", "beans"
];

export default function RecipeFinder() {
  const [selected, setSelected] = useState([]);
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addIngredient = (ing) => {
    const trimmed = ing.trim().toLowerCase();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected([...selected, trimmed]);
    }
    setInput('');
  };

  const removeIngredient = (ing) => {
    setSelected(selected.filter(i => i !== ing));
  };

const handleGenerate = async () => {
  if (selected.length === 0) return;

  setLoading(true);
  setError(null);
  setRecipes([]);

  try {
    const res = await fetch(`${NODE_API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `I have these ingredients: ${selected.join(", ")}. Suggest recipes.`
        // NO hf_token here anymore!
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Server error ${res.status}`);
    }

    const data = await res.json();
    const content = data.response;

    try {
      const parsed = JSON.parse(content);
      setRecipes(parsed.recipes || []);
    } catch (e) {
      setError("Could not parse recipes. Try again.");
      console.error(e, content);
    }
  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-green-800">
          What's in Your Kitchen?
        </h1>
        <p className="text-center text-lg text-gray-700 mb-10">
          Select or type ingredients → get recipe ideas
        </p>

        {/* Ingredient selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-green-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map(ing => (
              <div
                key={ing}
                className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  className="text-green-700 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient(input))}
              placeholder="Type ingredient (e.g. carrot) and press Enter"
              className="flex-1 px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => addIngredient(input)}
              className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
            >
              Add
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-5">
            <p className="text-sm text-gray-600 mb-2">Common ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map(ing => (
                <button
                  key={ing}
                  onClick={() => !selected.includes(ing) && setSelected([...selected, ing])}
                  className={`px-3 py-1.5 text-sm rounded-full border transition ${
                    selected.includes(ing)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  {ing}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="text-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={`
              px-10 py-5 rounded-2xl text-xl font-bold shadow-lg transition-all transform
              ${loading || selected.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white'
              }
            `}
          >
            {loading ? 'Finding tasty ideas...' : 'Get Recipe Ideas'}
          </button>
        </div>

        {/* Recipes grid */}
        {error && (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl">
            {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-green-800 mb-3">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{recipe.description}</p>

                  <div className="text-sm text-gray-500 mb-2">
                    ⏱ {recipe.time} • 🍽 {recipe.servings}
                  </div>

                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-800 mb-2">Ingredients:</h4>
                    <ul className="text-sm space-y-1.5">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span className={ing.includes('you have') ? 'font-medium' : ''}>
                            {ing}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Steps:</h4>
                    <ol className="text-sm space-y-2 list-decimal pl-5">
                      {recipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recipes.length === 0 && !loading && selected.length > 0 && !error && (
          <div className="text-center text-gray-500 py-12">
            Click "Get Recipe Ideas" to see suggestions
          </div>
        )}
      </div>
    </div>
  );
}