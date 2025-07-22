import React, { useState, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const NEEDS_FIELDS = ['Rent', 'Transport', 'Tax', 'Grocery', 'Recharge', 'Gym', 'Loans/EMI s'] as const;
const WANTS_FIELDS = ['Clothing', 'Food', 'Movies', 'Subscriptions'] as const;
const SAVINGS_FIELDS = ['Emergency', 'Mutual Funds '] as const;

type NeedsField = typeof NEEDS_FIELDS[number];
type WantsField = typeof WANTS_FIELDS[number];
type SavingsField = typeof SAVINGS_FIELDS[number];
type ExpenseField = NeedsField | WantsField | SavingsField;

interface SalaryData {
  partTime: string;
  miniJob: string;
  blockedMoney: string;
  partTimeDate: string;
  miniJobDate: string;
  blockedMoneyDate: string;
}

type Expenses = Record<ExpenseField, string>;

const BudgetPlanner: React.FC = () => {
  const [month, setMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [salaryData, setSalaryData] = useState<SalaryData>({
    partTime: '',
    miniJob: '',
    blockedMoney: '',
    partTimeDate: '',
    miniJobDate: '',
    blockedMoneyDate: '',
  });

  // Initialize expenses with empty strings for all fields
  const [expenses, setExpenses] = useState<Expenses>(() => {
    const initialExpenses = {} as Expenses;
    [...NEEDS_FIELDS, ...WANTS_FIELDS, ...SAVINGS_FIELDS].forEach(field => {
      initialExpenses[field] = '';
    });
    return initialExpenses;
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const calculateTotalSalary = () => {
    const { partTime, miniJob, blockedMoney } = salaryData;
    return (+partTime || 0) + (+miniJob || 0) + (+blockedMoney || 0);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryData({ ...salaryData, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as ExpenseField;
    setExpenses({ ...expenses, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salary = calculateTotalSalary();

    const needsIds: ExpenseField[] = [...NEEDS_FIELDS];
    const wantsIds: ExpenseField[] = [...WANTS_FIELDS];
    const savingsIds: ExpenseField[] = [...SAVINGS_FIELDS];

    const sumValues = (ids: ExpenseField[]) => ids.reduce((sum, id) => sum + (+expenses[id] || 0), 0);

    const totalNeeds = sumValues(needsIds);
    const totalWants = sumValues(wantsIds);
    const totalSavings = sumValues(savingsIds);
    const totalExpenses = totalNeeds + totalWants + totalSavings;

    const idealNeeds = salary * 0.5;
    const idealWants = salary * 0.3;
    const idealSavings = salary * 0.2;

    const newAlerts: string[] = [];
    if ((totalNeeds / salary) > 0.55) newAlerts.push('⚠️ You are spending more than 55% on Needs. Consider reducing fixed costs.');
    if ((totalWants / salary) > 0.35) newAlerts.push('⚠️ Wants exceed 35%. Try to cut back on non-essential spending.');
    if ((totalSavings / salary) < 0.15) newAlerts.push('⚠️ You are saving less than 15%. Consider prioritizing savings.');
    if (totalExpenses > salary) newAlerts.push('🚨 You are spending more than you earn! Immediate review needed.');
    if (newAlerts.length === 0) newAlerts.push('✅ Your budget is well balanced. Keep it up!');
    setAlerts(newAlerts);

    const summaryMsg = `Month: ${month}\n
Total Monthly Income: €${salary.toFixed(2)}\nTotal Expenses: €${totalExpenses.toFixed(2)}\n
Needs: €${totalNeeds.toFixed(2)} (${((totalNeeds / salary) * 100).toFixed(1)}%) | Ideal: €${idealNeeds.toFixed(2)}\nWants: €${totalWants.toFixed(2)} (${((totalWants / salary) * 100).toFixed(1)}%) | Ideal: €${idealWants.toFixed(2)}\nSavings: €${totalSavings.toFixed(2)} (${((totalSavings / salary) * 100).toFixed(1)}%) | Ideal: €${idealSavings.toFixed(2)}\n
Salary Credit Dates:\n- Part-Time: ${salaryData.partTimeDate || 'N/A'}\n- Mini Job: ${salaryData.miniJobDate || 'N/A'}\n- Blocked Money: ${salaryData.blockedMoneyDate || 'N/A'}`;

    setSummary(summaryMsg);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartRef.current) {
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Needs', 'Wants', 'Savings'],
          datasets: [
            {
              data: [totalNeeds, totalWants, totalSavings],
              backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
              hoverOffset: 10,
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 14 },
              },
            },
          },
        },
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto mb-6">
        <label htmlFor="budget-month" className="block text-sm font-semibold text-gray-700 mb-1">
          📅 Select Budget Month
        </label>
        <input
          type="month"
          id="budget-month"
          name="budget-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto space-y-8">
        <fieldset className="border border-blue-200 p-6 rounded-xl">
          <legend className="text-xl font-semibold text-blue-700">📄 General Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {['partTime', 'miniJob', 'blockedMoney'].map((key) => (
              <div key={key}>
                <label htmlFor={`income-${key}`} className="block font-medium text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1')} (€)
                </label>
                <input
                  type="number"
                  id={`income-${key}`}
                  name={key}
                  placeholder={`Enter ${key}`}
                  aria-label={`Income - ${key}`}
                  value={salaryData[key as keyof SalaryData]}
                  onChange={handleSalaryChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="date"
                  name={`${key}Date`}
                  value={salaryData[`${key}Date` as keyof SalaryData]}
                  onChange={handleSalaryChange}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block font-medium text-sm text-gray-700">Total Salary (€)</label>
            <input
              type="number"
              readOnly
              value={calculateTotalSalary().toFixed(2)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </fieldset>

        {[['Needs', '💼'], ['Wants', '🎯'], ['Savings', '💸']].map(([section, emoji]) => {
          const fields = section === 'Needs'
            ? NEEDS_FIELDS
            : section === 'Wants'
              ? WANTS_FIELDS
              : SAVINGS_FIELDS;
          return (
            <fieldset key={section} className="border border-blue-200 p-6 rounded-xl">
              <legend className="text-xl font-semibold text-blue-700">{emoji} {section}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {fields.map(field => (
                  <div key={field}>
                    <label htmlFor={`${section.toLowerCase()}-${field}`} className="block font-medium text-sm text-gray-700">
                      {field.replace(/([A-Z])/g, ' $1')} (€)
                    </label>
                    <input
                      type="number"
                      id={`${section.toLowerCase()}-${field}`}
                      name={field}
                      placeholder={`Enter ${field}`}
                      aria-label={`${section} - ${field}`}
                      value={expenses[field]}
                      onChange={handleExpenseChange}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="text-center">
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition">
            💡 Calculate Budget
          </button>
        </div>
      </form>

      {summary && (
        <section className="bg-white p-6 rounded-xl shadow-lg mt-10 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">📊 Budget Summary</h2>
          <div className="mb-4 space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-md border-l-4 text-sm font-medium shadow-sm transition duration-300 ease-in-out transform hover:scale-[1.01] ${
                  alert.includes('✅')
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : alert.includes('⚠️')
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}
              >
                {alert}
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-md border mt-6 text-sm text-gray-800">
            <h3 className="font-semibold mb-2 text-blue-600">Detailed Breakdown:</h3>
            <pre className="whitespace-pre-wrap font-mono">{summary}</pre>
          </div>
          <div className="mt-6 bg-white border rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium mb-2 text-center text-gray-700">Pie Chart Overview</h3>
            <canvas ref={chartRef} id="budgetChart" />
          </div>
        </section>
      )}
    </div>
  );
};

export default BudgetPlanner;
