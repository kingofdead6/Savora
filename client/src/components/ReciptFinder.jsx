// src/RecipeFinder.jsx
import { useState, useEffect, useRef } from 'react';
import { PYTHON_API } from "../../api.js";

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

  const dropdownRef = useRef(null);
  const t = translations[lang];
  const isArabic = lang === 'ar';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

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

  useEffect(() => {
    if (navigator.language.startsWith('ar')) setLang('ar');
  }, []);

  return (
    <div 
      dir={isArabic ? "rtl" : "ltr"} 
      className="min-h-screen bg-[#f8f9f4] font-sans pb-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header - smaller on mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-emerald-700 tracking-tight">Savora</h1>
          <p className="text-emerald-600 text-lg sm:text-2xl mt-2 font-light">{t.subtitle}</p>
        </div>

        {/* Language Switch - more visible on mobile */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-5 py-2 bg-white rounded-full shadow-sm border border-emerald-200 hover:border-emerald-400 font-medium text-sm sm:text-base transition"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-emerald-100">

          {/* Ingredients Section */}
          <div className="mb-8">
            <label className="block text-emerald-800 font-semibold text-lg sm:text-xl mb-4">
              {t.ingredientsLabel}
            </label>

            {/* Selected chips - wrap nicely */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
              {selected.map(item => (
                <div
                  key={item}
                  className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-emerald-200 text-sm sm:text-base"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeIngredient(item)}
                    className="text-emerald-600 hover:text-red-600 text-lg sm:text-xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selected.length === 0 && (
                <span className="text-gray-400 italic text-sm">No ingredients added yet</span>
              )}
            </div>

            {/* Dropdown - mobile friendly */}
            <div className="relative mb-6" ref={dropdownRef}>
              <div
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-400 transition touch-manipulation"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={customInput ? "text-gray-900" : "text-gray-400 text-sm sm:text-base"}>
                  {customInput || t.dropdownPlaceholder}
                </span>
                <span className="text-emerald-600 text-lg sm:text-xl">▼</span>
              </div>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[60vh] sm:max-h-80 overflow-y-auto z-50">
                  {bilingualIngredients.map(item => (
                    <div
                      key={item.en}
                      onClick={() => addIngredient(item[lang])}
                      className="px-5 py-4 hover:bg-emerald-50 cursor-pointer border-b last:border-none flex justify-between items-center text-sm sm:text-base"
                    >
                      <span>{item[lang]}</span>
                      <span className="text-emerald-600 text-xs sm:text-sm">Add</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom input - better keyboard handling */}
            <div className="flex flex-col sm:flex-row gap-3">
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
    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-base sm:text-lg"
  />

  <button
    onClick={() => addIngredient(customInput)}
    disabled={!customInput.trim()}
    className={`px-6 py-4 rounded-2xl font-medium text-sm sm:text-base transition w-full sm:w-auto ${
      customInput.trim()
        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    {t.addCustom}
  </button>
</div>

          </div>

          {/* Number of recipes - better mobile layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-8">
            <span className="text-emerald-800 font-semibold text-base sm:text-lg whitespace-nowrap">
              {t.numRecipes}
            </span>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setNumRecipes(n)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-semibold transition-all text-sm ${
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

          {/* Generate Button - full width, bigger touch area */}
          <button
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
            className={`w-full py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-lg transition-all touch-manipulation ${
              loading || selected.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-95'
            }`}
          >
            {loading ? t.loading : t.generate}
          </button>
        </div>

        {/* Results / Loading */}
        {loading && (
          <div className="mt-10 sm:mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 animate-pulse h-[380px] sm:h-[420px]"
              >
                <div className="bg-gray-200 h-3" />
                <div className="p-6 sm:p-8">
                  <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                  <div className="flex gap-6 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="mb-8">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="flex flex-wrap gap-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-7 bg-gray-200 rounded-full w-24"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="space-y-2.5">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 text-center text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100 mx-2 sm:mx-0">
            {error}
          </div>
        )}

        {recipes.length > 0 && !loading && (
          <div className="mt-10 sm:mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recipes.map((recipe, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3" />
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-4">
                    {recipe.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                    {recipe.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                    <div>{t.time}: <span className="font-semibold text-emerald-700">{recipe.time}</span></div>
                    <div>{t.servings}: <span className="font-semibold text-emerald-700">{recipe.servings}</span></div>
                  </div>

                  <div className="mb-8">
                    <div className="font-semibold text-emerald-800 mb-4 text-base sm:text-lg">{t.ingredients}</div>
                    <div className="flex flex-wrap gap-2.5">
                      {recipe.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-emerald-200 shadow-sm"
                        >
                          {ing}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-emerald-800 mb-4 text-base sm:text-lg">{t.steps}</div>
                    <ol className="list-decimal pl-5 sm:pl-6 space-y-2.5 text-gray-700 text-sm sm:text-base">
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
          <div className="text-center text-gray-500 mt-12 sm:mt-16 text-base sm:text-lg italic px-4">
            {t.noRecipes}
          </div>
        )}
      </div>
    </div>
  );
}