// src/RecipeFinder.jsx
import { useState, useEffect, useMemo } from 'react';
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
    searchPlaceholder: "Search ingredients...",
    add: "Add",
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
    searchPlaceholder: "ابحث عن مكونات...",
    add: "إضافة",
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
  const [searchTerm, setSearchTerm] = useState('');
  const [numRecipes, setNumRecipes] = useState(3);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[lang];
  const isArabic = lang === 'ar';

  // Filter ingredients based on current language + search
  const filteredIngredients = useMemo(() => {
    return bilingualIngredients.filter(item => {
      const name = item[lang].toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, lang]);

  const addIngredient = (name) => {
    if (!name || selected.includes(name)) return;
    setSelected([...selected, name]);
    setSearchTerm('');
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
      : `Reply in ${lang} only. Suggest exactly ${numRecipes} recipes.`;

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
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-emerald-700 tracking-tighter">Savora</h1>
          <p className="text-emerald-600 text-xl mt-2">{t.subtitle}</p>
        </div>

        {/* Language Switch */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-5 py-2 bg-white shadow rounded-full text-sm font-medium border border-emerald-200 hover:border-emerald-400 transition"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Ingredients Section */}
          <div className="mb-10">
            <label className="block text-emerald-700 font-medium mb-3 text-lg">
              {t.ingredientsLabel}
            </label>

            {/* Selected chips */}
            <div className="flex flex-wrap gap-3 mb-6">
              {selected.map(item => (
                <div
                  key={item}
                  className="bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-2xl flex items-center gap-3 text-base font-medium shadow-sm"
                >
                  {item}
                  <button
                    onClick={() => removeIngredient(item)}
                    className="text-emerald-600 hover:text-red-600 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Searchable Dropdown */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-lg"
              />

              {/* Suggestions dropdown */}
              {searchTerm && (
                <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-72 overflow-auto z-50">
                  {filteredIngredients.length === 0 ? (
                    <div className="p-6 text-gray-400 text-center">No matches</div>
                  ) : (
                    filteredIngredients.map(item => (
                      <div
                        key={item.en}
                        onClick={() => addIngredient(item[lang])}
                        className="px-6 py-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-none"
                      >
                        <span className="text-lg">{item[lang]}</span>
                        <span className="text-emerald-600 text-sm opacity-70">Add</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Number of recipes */}
            <div className="flex items-center gap-4 mt-8">
              <span className="text-emerald-700 font-medium whitespace-nowrap">
                {t.numRecipes}
              </span>
              <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumRecipes(n)}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                      numRecipes === n
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={`w-full py-5 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-emerald-200 ${
              loading || selected.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-[0.985]'
            }`}
          >
            {loading ? t.loading : t.generate}
          </button>
        </div>

        {/* Results */}
        {error && (
          <div className="mt-8 text-center text-red-600 bg-red-50 p-6 rounded-2xl">
            {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 h-3" />
                <div className="p-7">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-4 leading-tight">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex gap-8 text-sm text-gray-500 mb-6">
                    <div>{t.time}: <span className="font-medium text-emerald-700">{recipe.time}</span></div>
                    <div>{t.servings}: <span className="font-medium text-emerald-700">{recipe.servings}</span></div>
                  </div>

                  <div className="mb-6">
                    <div className="font-semibold text-emerald-800 mb-3">{t.ingredients}</div>
                    <ul className="space-y-2 text-gray-700">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-emerald-500">•</span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-emerald-800 mb-3">{t.steps}</div>
                    <ol className="list-decimal pl-5 space-y-3 text-gray-700 text-[15px]">
                      {recipe.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recipes.length === 0 && !loading && selected.length > 0 && (
          <div className="text-center text-gray-400 mt-16 text-lg">
            {t.noRecipes}
          </div>
        )}
      </div>
    </div>
  );
}