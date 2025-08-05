import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">📘 Budget Planner</h1>
          <p className="text-gray-600 text-sm">
            Seamlessly manage and review your monthly budgets. Start planning or revisit your past entries.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/budget-planner")}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium shadow-md transition duration-200"
          >
            ➕ Create New Budget
          </button>

          <button
            onClick={() => navigate("/view-budget")}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-medium shadow-md transition duration-200"
          >
            👁️ View Existing Budget
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Budget Planner. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Home;