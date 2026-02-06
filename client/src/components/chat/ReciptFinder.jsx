// src/RecipeFinder.jsx
import { useState, useEffect } from 'react';
import { PYTHON_API } from "../../../api.js";

const commonIngredients = [
  "tomato", "potato", "onion", "carrot", "zucchini", "eggplant", "bell pepper", "cucumber",
  "lettuce", "spinach", "broccoli", "cauliflower", "cabbage", "garlic", "apple", "banana",
  "orange", "lemon", "strawberry", "mango", "rice", "pasta", "eggs", "chicken", "beans"
];

const translations = {
  en: {
    title: "What's in Your Kitchen?",
    subtitle: "Select or type ingredients → get recipe ideas",
    placeholder: "Type an ingredient (e.g. carrot) and press Enter",
    add: "Add",
    quick: "Quick picks:",
    generate: "Get Recipe Ideas",
    loading: "Finding tasty ideas...",
    errorParse: "Could not parse recipes. Try again.",
    noRecipes: "Click \"Get Recipe Ideas\" to see suggestions",
    time: "⏱",
    servings: "🍽",
    ingredients: "Ingredients:",
    steps: "Steps:"
  },
  ar: {
    title: "ماذا في مطبخك؟",
    subtitle: "اختر أو اكتب المكونات → احصل على أفكار وصفات",
    placeholder: "اكتب مكونًا (مثال: جزر) واضغط Enter",
    add: "إضافة",
    quick: "اقتراحات سريعة:",
    generate: "احصل على أفكار الوصفات",
    loading: "جاري البحث عن أفكار لذيذة...",
    errorParse: "تعذر تحليل الوصفات. حاول مرة أخرى.",
    noRecipes: "اضغط \"احصل على أفكار الوصفات\" لمشاهدة الاقتراحات",
    time: "⏱",
    servings: "🍽",
    ingredients: "المكونات:",
    steps: "الخطوات:"
  }
};

export default function RecipeFinder() {
  const [selected, setSelected] = useState([]);
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en'); // default English

  const t = translations[lang];
  const isArabic = lang === 'ar';

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
      const ingredientsText = selected.join(", ");
      const langPrompt = isArabic 
        ? "رد باللغة العربية فقط. اقترح وصفات بالعربية."
        : "Reply in English only. Suggest recipes in English.";

      const message = `${langPrompt} I have these ingredients: ${ingredientsText}. Suggest recipes.`;

      const res = await fetch(`${PYTHON_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || `Server error ${res.status}`);
      }

      const data = await res.json();
      const content = data.response;

      const parsed = JSON.parse(content);
      setRecipes(parsed.recipes || []);
    } catch (err) {
      setError(err.message || (isArabic ? "حدث خطأ ما" : "Something went wrong"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Optional: detect browser language on first load
  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ar')) {
      setLang('ar');
    }
  }, []);

  return (
    <div 
      dir={isArabic ? "rtl" : "ltr"}
      className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 ${isArabic ? 'font-arabic' : ''}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-800 dark:text-green-400">
            {t.title}
          </h1>
          <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
            {t.subtitle}
          </p>
        </div>

        {/* Ingredient selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-7 mb-10 border border-green-200 dark:border-green-700">
          <div className="flex flex-wrap gap-2.5 mb-5">
            {selected.map(ing => (
              <div
                key={ing}
                className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-4 py-2 rounded-full flex items-center gap-2 text-sm sm:text-base shadow-sm"
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  className="text-green-700 dark:text-green-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient(input))}
              placeholder={t.placeholder}
              className="flex-1 px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
            />
            <button
              onClick={() => addIngredient(input)}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-medium transition shadow-md sm:w-auto w-full"
            >
              {t.add}
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t.quick}
            </p>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map(ing => (
                <button
                  key={ing}
                  onClick={() => !selected.includes(ing) && setSelected([...selected, ing])}
                  className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${
                    selected.includes(ing)
                      ? 'bg-green-600 text-white border-green-600 dark:bg-green-700 dark:border-green-600'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {ing}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="text-center mb-10 sm:mb-14">
          <button
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={`
              px-10 sm:px-16 py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-lg transition-all transform
              ${loading || selected.length === 0
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white'
              }
            `}
          >
            {loading ? t.loading : t.generate}
          </button>
        </div>

        {error && (
          <div className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-xl mb-10">
            {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-400 mb-3 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {t.time} {recipe.time} • {t.servings} {recipe.servings}
                  </div>

                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {t.ingredients}
                    </h4>
                    <ul className="text-sm space-y-1.5 text-gray-700 dark:text-gray-300">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400">•</span>
                          <span className={ing.includes('you have') || ing.includes('لديك') ? 'font-medium' : ''}>
                            {ing}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {t.steps}
                    </h4>
                    <ol className="text-sm space-y-2 list-decimal pl-5 text-gray-700 dark:text-gray-300">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recipes.length === 0 && !loading && selected.length > 0 && !error && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            {t.noRecipes}
          </div>
        )}

        {loading && recipes.length === 0 && (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-96 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}