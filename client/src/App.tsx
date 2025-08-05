// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BudgetPlanner from './pages/BudgetPlanner';
import ViewBudget from './pages/ViewBudgets';

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white font-sans">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="relative mb-6">
          <div className="absolute left-0">
            <button className="text-blue-500 hover:underline px-4" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
          <h2 className="text-2xl font-bold text-center text-blue-700">
            Monthly Budget Planner
          </h2>
        </div>
      </header>

      <div className="w-full mx-auto p-4 sm:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/budget-planner" element={<BudgetPlanner />} />
          <Route path="/view-budget" element={<ViewBudget />} />
        </Routes>
      </div>

      <footer className="bg-gray-200 text-center text-sm text-gray-600 py-4 mt-12">
        &copy; {new Date().getFullYear()} Monthly Budget Planner. All rights reserved.
      </footer>
    </main>
  );
};

export default App;
