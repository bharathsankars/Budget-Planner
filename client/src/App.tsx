import React from 'react';
import BudgetPlanner from './components/BudgetPlanner';

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white font-sans">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl text-center font-bold text-blue-700">💰 Budget Planner</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <BudgetPlanner />
      </div>

      <footer className="bg-gray-200 text-center text-sm text-gray-600 py-4 mt-12">
        &copy; {new Date().getFullYear()} Monthly Budget Planner. All rights reserved.
      </footer>
    </main>
  );
}

export default App;
