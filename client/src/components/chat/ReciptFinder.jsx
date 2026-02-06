// src/RecipeFinder.jsx
import { useState, useEffect } from 'react';
import { PYTHON_API } from "../../../api.js";

const bilingualIngredients = [
  { en: "tomato", ar: "طماطم" },
  { en: "potato", ar: "بطاطس" },
  { en: "onion", ar: "بصل" },
  { en: "carrot", ar: "جزر" },
  { en: "zucchini", ar: "كوسا" },
  { en: "eggplant", ar: "باذنجان" },
  { en: "bell pepper", ar: "فلفل حلو" },
  { en: "cucumber", ar: "خيار" },
  { en: "lettuce", ar: "خس" },
  { en: "spinach", ar: "سبانخ" },
  { en: "broccoli", ar: "بروكولي" },
  { en: "cauliflower", ar: "قرنبيط" },
  { en: "cabbage", ar: "ملفوف" },
  { en: "garlic", ar: "ثوم" },
  { en: "apple", ar: "تفاح" },
  { en: "banana", ar: "موز" },
  { en: "orange", ar: "برتقال" },
  { en: "lemon", ar: "ليمون" },
  { en: "strawberry", ar: "فراولة" },
  { en: "mango", ar: "مانجو" },
  { en: "rice", ar: "أرز" },
  { en: "pasta", ar: "معكرونة" },
  { en: "eggs", ar: "بيض" },
  { en: "chicken", ar: "دجاج" },
  { en: "beans", ar: "فاصوليا" },
];

const translations = {
  en: {
    title: "Savora",
    subtitle: "Tell me what's in your kitchen and I'll suggest delicious recipes",
    dropdownPlaceholder: "Select or type an ingredient...",
    addCustom: "Add custom",
    numRecipes: "Number of recipes",
    generate: "Generate Recipes",
    loading: "Savora is thinking...",
    ingredientsLabel: "Your ingredients",
    noRecipes: "Add some ingredients and choose how many recipes you want",
    time: "Time",
    servings: "Servings",
    ingredients: "Ingredients",
    steps: "Steps",
  },
  ar: {
    title: "سافورا",
    subtitle: "قل لي ماذا في مطبخك وسأقترح لك وصفات شهية",
    dropdownPlaceholder: "اختر أو اكتب مكونًا...",
    addCustom: "إضافة مخصص",
    numRecipes: "عدد الوصفات",
    generate: "احصل على الوصفات",
    loading: "سافورا يفكر...",
    ingredientsLabel: "مكوناتك",
    noRecipes: "أضف بعض المكونات واختر عدد الوصفات",
    time: "الوقت",
    servings: "الحصص",
    ingredients: "المكونات",
    steps: "الخطوات",
  }
};

export default function RecipeFinder() {
  const [lang, setLang] = useState('en');
  const [selected, setSelected] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [numRecipes, setNumRecipes] = useState(3);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[lang];
  const isArabic = lang === 'ar';

  const addIngredient = (name) => {
    const trimmed = name.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected([...selected, trimmed]);
    setCustomInput('');
    setDropdownOpen(false);
  };

  const removeIngredient = (name) => {
    setSelected(selected.filter(item => item !== name));
  };

  const handleGenerate = async () => {
    if (selected.length === 0) return;

    setLoading(true);
    setError(null);
    setRecipes([]);

    const ingredientsText = selected.join(", ");
    const langPrompt = isArabic
      ? `رد باللغة العربية فقط. اقترح بالضبط ${numRecipes} وصفات.`
      : `Reply in English only. Suggest exactly ${numRecipes} recipes.`;

    const message = `${langPrompt} I have these ingredients: ${ingredientsText}. Suggest recipes.`;

    try {
      const res = await fetch(`${PYTHON_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const parsed = JSON.parse(data.response);
      setRecipes(parsed.recipes || []);
    } catch (err) {
      setError(err.message || (isArabic ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  // Auto detect Arabic
  useEffect(() => {
    if (navigator.language.startsWith('ar')) setLang('ar');
  }, []);

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#f8f9f4] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold text-emerald-700 tracking-tight">Savora</h1>
          <p className="text-emerald-600 text-xl md:text-2xl mt-3 font-light">{t.subtitle}</p>
        </div>

        {/* Language Switch */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-6 py-2.5 bg-white rounded-full shadow-sm border border-emerald-200 hover:border-emerald-400 font-medium transition"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-emerald-100">

          {/* Ingredients Section */}
          <div className="mb-10">
            <label className="block text-emerald-800 font-semibold text-xl mb-4">
              {t.ingredientsLabel}
            </label>

            {/* Selected chips */}
            <div className="flex flex-wrap gap-3 mb-6">
              {selected.map(item => (
                <div
                  key={item}
                  className="bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-sm border border-emerald-200"
                >
                  <span className="font-medium">{item}</span>
                  <button
                    onClick={() => removeIngredient(item)}
                    className="text-emerald-600 hover:text-red-600 text-xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selected.length === 0 && (
                <span className="text-gray-400 italic">No ingredients added yet</span>
              )}
            </div>

            {/* Dropdown */}
            <div className="relative mb-6">
              <div
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-400 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={customInput ? "text-gray-900" : "text-gray-400"}>
                  {customInput || t.dropdownPlaceholder}
                </span>
                <span className="text-emerald-600 text-xl">▼</span>
              </div>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-80 overflow-auto z-50">
                  {bilingualIngredients.map(item => (
                    <div
                      key={item.en}
                      onClick={() => addIngredient(item[lang])}
                      className="px-6 py-4 hover:bg-emerald-50 cursor-pointer border-b last:border-none flex justify-between items-center"
                    >
                      <span className="text-lg font-medium">{item[lang]}</span>
                      <span className="text-emerald-600 text-sm">Add</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom input + Add button */}
            <div className="flex gap-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient(customInput);
                  }
                }}
                placeholder={isArabic ? "أضف مكون غير موجود..." : "Add custom ingredient..."}
                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-lg"
              />
              <button
                onClick={() => addIngredient(customInput)}
                disabled={!customInput.trim()}
                className={`px-8 py-4 rounded-2xl font-medium transition ${
                  customInput.trim()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t.addCustom}
              </button>
            </div>
          </div>

          {/* Number of recipes */}
          <div className="flex items-center gap-5 mb-10">
            <span className="text-emerald-800 font-semibold text-lg whitespace-nowrap">
              {t.numRecipes}
            </span>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setNumRecipes(n)}
                  className={`w-11 h-11 rounded-full font-semibold transition-all text-sm ${
                    numRecipes === n
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg transition-all ${
              loading || selected.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-[0.98]'
            }`}
          >
            {loading ? t.loading : t.generate}
          </button>
        </div>

        {/* Results / Loading Animation */}
        {loading && (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[420px] animate-pulse"
              >
                <div className="bg-gray-200 h-3" />
                <div className="p-8">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-6"></div>
                  <div className="flex gap-6 mb-6">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="mb-8">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="flex flex-wrap gap-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-8 bg-gray-200 rounded-full w-28"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-5 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 text-center text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {recipes.length > 0 && !loading && (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3" />
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex gap-6 text-sm text-gray-600 mb-6">
                    <div>{t.time}: <span className="font-semibold text-emerald-700">{recipe.time}</span></div>
                    <div>{t.servings}: <span className="font-semibold text-emerald-700">{recipe.servings}</span></div>
                  </div>

                  <div className="mb-8">
                    <div className="font-semibold text-emerald-800 mb-4 text-lg">{t.ingredients}</div>
                    <div className="flex flex-wrap gap-3">
                      {recipe.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-medium border border-emerald-200 shadow-sm"
                        >
                          {ing}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-emerald-800 mb-4 text-lg">{t.steps}</div>
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                      {recipe.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recipes.length === 0 && !loading && selected.length > 0 && (
          <div className="text-center text-gray-500 mt-16 text-lg italic">
            {t.noRecipes}
          </div>
        )}
      </div>
    </div>
  );
}