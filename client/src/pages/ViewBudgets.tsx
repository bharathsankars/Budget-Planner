import React, { useEffect, useState } from "react";

interface SalaryData {
  previousBalance?: string;
  partTime: string;
  miniJob: string;
  blockedMoney: string;
  partTimeDate: string;
  miniJobDate: string;
  blockedMoneyDate: string;
}

interface BudgetData {
  month: string;
  salaryData: SalaryData;
  expenses: Record<string, string>;
}

const NEEDS = [
  "Rent",
  "Transport",
  "Tax",
  "Grocery",
  "Recharge",
  "Gym",
  "LoansEMI",
  "OtherExpenses",
];
const WANTS = ["Clothing", "Food", "Movies", "Subscriptions"];
const SAVINGS = ["Emergency", "MutualFunds"];

const ViewBudget: React.FC = () => {
  const [month, setMonth] = useState<string>("");
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchBudget = async () => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/budgets/${month}`);
      if (!res.ok) throw new Error("Budget not found");
      const data = await res.json();
      setBudget(data);
    } catch (err) {
      console.error("Error fetching budget:", err);
      setBudget(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month) fetchBudget();
  }, [month]);

  const calculateTotals = () => {
    const income =
      +(budget?.salaryData?.partTime ?? 0) +
      +(budget?.salaryData?.miniJob ?? 0) +
      +(budget?.salaryData?.blockedMoney ?? 0) +
      +(budget?.salaryData?.previousBalance ?? 0);

    const categorySum = (fields: string[]) =>
      fields.reduce(
        (acc, key) => acc + +((budget?.expenses ?? {})[key] || 0),
        0
      );

    return {
      income: income.toFixed(2),
      needs: categorySum(NEEDS).toFixed(2),
      wants: categorySum(WANTS).toFixed(2),
      savings: categorySum(SAVINGS).toFixed(2),
    };
  };

  const totals = budget ? calculateTotals() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="relative mb-6">

          <h2 className="text-2xl font-bold text-center text-blue-700">
            View Budget Summary
          </h2>
        </div>

        <div className="mb-6">
          <label
            htmlFor="month"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            📅 Select Month
          </label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading budget data...</p>
        ) : budget ? (
          <>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg text-blue-600 mb-2">
                💰 Salary Details
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(budget.salaryData).map(([key, val]) => (
                  <li key={key} className="bg-blue-50 p-3 rounded-md">
                    <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
                    {val || "N/A"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg text-indigo-600 mb-2">
                💸 Expense Breakdown
              </h3>

              {[
                { label: "Needs", fields: NEEDS, color: "bg-indigo-50" },
                { label: "Wants", fields: WANTS, color: "bg-yellow-50" },
                { label: "Savings", fields: SAVINGS, color: "bg-green-50" },
              ].map(({ label, fields, color }) => (
                <div key={label} className="mb-4">
                  <h4 className="font-semibold text-md mb-1">{label}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {fields.map((key) => (
                      <li key={key} className={`${color} p-3 rounded-md`}>
                        <strong>{key}: </strong>€{budget.expenses[key] || "0"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-6 text-sm bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-bold text-gray-700 mb-2">
                📊 Summary
              </h3>
              <p>
                <strong>Total Income:</strong> €{totals?.income}
              </p>
              <p>
                <strong>Total Needs:</strong> €{totals?.needs}
              </p>
              <p>
                <strong>Total Wants:</strong> €{totals?.wants}
              </p>
              <p>
                <strong>Total Savings:</strong> €{totals?.savings}
              </p>
              <p>
                <strong>Total Expenses:</strong> €
                {(
                  (totals && totals.needs !== undefined ? +totals.needs : 0) +
                  (totals && totals.wants !== undefined ? +totals.wants : 0) +
                  (totals && totals.savings !== undefined ? +totals.savings : 0)
                ).toFixed(2)}
              </p>
            </div>
          </>
        ) : (
          month && (
            <p className="text-center text-red-600 mt-4">
              No budget data found for selected month.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default ViewBudget;
