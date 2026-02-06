// src/components/Welcome.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Welcome() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-extrabold text-emerald-700 tracking-tighter mb-4">
          Savora
        </h1>
        <p className="text-xl md:text-2xl text-emerald-600 font-light mb-10">
          Smart recipes from what you already have
        </p>

        <div className="w-24 h-24 mx-auto mb-12">
          <div className="w-full h-full bg-emerald-600 rounded-3xl animate-pulse"></div>
        </div>

        <p className="text-gray-600 text-lg mb-8">
          Loading your kitchen assistant...
        </p>

        <button
          onClick={() => navigate("/home")}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-xl font-medium hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-emerald-200"
        >
          Start Cooking
        </button>
      </div>

      <p className="absolute bottom-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} Savora
      </p>
    </div>
  );
}