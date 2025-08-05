import React, { useState, useRef } from "react";
import { Chart } from "chart.js/auto";

const NEEDS_FIELDS = [
  "Rent",
  "Transport",
  "Tax",
  "Grocery",
  "Recharge",
  "Gym",
  "LoansEMI",
  "OtherExpenses",
] as const;
const WANTS_FIELDS = ["Clothing", "Food", "Movies", "Subscriptions"] as const;
const SAVINGS_FIELDS = ["Emergency", "MutualFunds"] as const;

type ExpenseField = (
  | typeof NEEDS_FIELDS
  | typeof WANTS_FIELDS
  | typeof SAVINGS_FIELDS
)[number];

interface SalaryData {
  previousBalance?: string;
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
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [salaryData, setSalaryData] = useState<SalaryData>({
    previousBalance: "",
    partTime: "",
    miniJob: "",
    blockedMoney: "",
    partTimeDate: "",
    miniJobDate: "",
    blockedMoneyDate: "",
  });

  const [expenses, setExpenses] = useState<Expenses>(() => {
    const init = {} as Expenses;
    [...NEEDS_FIELDS, ...WANTS_FIELDS, ...SAVINGS_FIELDS].forEach(
      (f) => (init[f] = "")
    );
    return init;
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const monthRef = useRef<HTMLInputElement>(null);

  const [useCurrentBalance, setUseCurrentBalance] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;

  const calculateTotalSalary = () => {
    if (useCurrentBalance) return +currentBalance || 0;
    const {
      partTime,
      miniJob,
      blockedMoney,
      previousBalance = "",
    } = salaryData;
    return (
      (+partTime || 0) +
      (+miniJob || 0) +
      (+blockedMoney || 0) +
      (+previousBalance || 0)
    );
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryData({ ...salaryData, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name as ExpenseField;
    setExpenses({ ...expenses, [key]: e.target.value });
  };

  const resetForm = () => {
    setSalaryData({
      previousBalance: "",
      partTime: "",
      miniJob: "",
      blockedMoney: "",
      partTimeDate: "",
      miniJobDate: "",
      blockedMoneyDate: "",
    });
    const reset = {} as Expenses;
    [...NEEDS_FIELDS, ...WANTS_FIELDS, ...SAVINGS_FIELDS].forEach(
      (f) => (reset[f] = "")
    );
    setExpenses(reset);
    setAlerts([]);
    setSummary("");
    setCurrentBalance("");
    setUseCurrentBalance(false);
  };

  const fetchBudgetForMonth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/budgets/${month}`);
      if (!res.ok) return resetForm();
      const data = await res.json();

      if (data.useCurrentBalance) {
        setUseCurrentBalance(true);
        setCurrentBalance(data.currentBalance || "");
      } else {
        setUseCurrentBalance(false);
        setSalaryData(data.salaryData || {});
      }
      setExpenses(data.expenses || {});
    } catch (err) {
      console.error("Fetch error:", err);
      resetForm();
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        month,
        useCurrentBalance,
        currentBalance: useCurrentBalance ? currentBalance : undefined,
        salaryData: useCurrentBalance ? undefined : salaryData,
        expenses,
      };
      const res = await fetch(`${API_URL}/api/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("✅ Budget saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      alert(" Failed to save budget");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salary = calculateTotalSalary();
    const sum = (fields: readonly ExpenseField[]) =>
      fields.reduce((a, f) => a + (+expenses[f] || 0), 0);

    const totalNeeds = sum(NEEDS_FIELDS);
    const totalWants = sum(WANTS_FIELDS);
    const totalSavings = sum(SAVINGS_FIELDS);
    const totalExpenses = totalNeeds + totalWants + totalSavings;

    const idealNeeds = salary * 0.5;
    const idealWants = salary * 0.3;
    const idealSavings = salary * 0.2;

    const a: string[] = [];
    if (totalNeeds / salary > 0.55)
      a.push("⚠️ Needs exceed 55% - reduce fixed costs.");
    if (totalWants / salary > 0.35)
      a.push("⚠️ Wants exceed 35% - trim non-essentials.");
    if (totalSavings / salary < 0.15)
      a.push("⚠️ Savings below 15% - prioritize saving.");
    if (totalExpenses > salary)
      a.push("🚨 Expenses exceed income - review immediately.");
    if (!a.length) a.push("✅ Budget is well balanced. Great job!");
    setAlerts(a);

    setSummary(
      `Month: ${month}\n\nIncome: €${salary.toFixed(
        2
      )}\nExpenses: €${totalExpenses.toFixed(2)}\n\n` +
        `Needs: €${totalNeeds} (${((totalNeeds / salary) * 100).toFixed(
          1
        )}%) | Ideal: €${idealNeeds}\n` +
        `Wants: €${totalWants} (${((totalWants / salary) * 100).toFixed(
          1
        )}%) | Ideal: €${idealWants}\n` +
        `Savings: €${totalSavings} (${((totalSavings / salary) * 100).toFixed(
          1
        )}%) | Ideal: €${idealSavings}\n\n` +
        `Dates:\n- Part-Time: ${
          salaryData.partTimeDate || "N/A"
        }\n- Mini Job: ${salaryData.miniJobDate || "N/A"}\n` +
        `- Blocked: ${salaryData.blockedMoneyDate || "N/A"}`
    );

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    if (chartRef.current) {
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "pie",
        data: {
          labels: ["Needs", "Wants", "Savings"],
          datasets: [
            {
              data: [totalNeeds, totalWants, totalSavings],
              backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"],
            },
          ],
        },
        options: {
          plugins: {
            legend: { position: "bottom", labels: { font: { size: 14 } } },
          },
        },
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen p-6">
      <div className="sticky top-0 bg-white z-10 p-4 shadow-md rounded-md mb-6 flex items-center gap-4">
        <div className="flex-1">
          <label
            htmlFor="budget-month"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            📅 Select Budget Month
          </label>
          <input
            type="month"
            id="budget-month"
            name="budget-month"
            ref={monthRef}
            value={month}
            onClick={() => monthRef.current?.showPicker?.()}
            onChange={(e) => setMonth(e.target.value)}
            onBlur={fetchBudgetForMonth}
            className="p-2 border border-gray-300 cursor-pointer rounded-md focus:ring-2 focus:ring-blue-400 w-full"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow space-y-6"
      >
        {/* Salary Inputs */}
        <fieldset className="border border-blue-200 p-4 rounded-lg">
          <legend className="text-blue-700 font-semibold">
            💰 Salary Information
          </legend>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2 mb-4">
            <label className="font-medium text-gray-700">
              Use Current Balance
            </label>
            <input
              type="checkbox"
              checked={useCurrentBalance}
              onChange={() => setUseCurrentBalance(!useCurrentBalance)}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {!useCurrentBalance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {["previousBalance", "partTime", "miniJob", "blockedMoney"].map(
                (key) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, " $1")} (€)
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={salaryData[key as keyof SalaryData]}
                      onChange={handleSalaryChange}
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                    <input
                      type="date"
                      name={`${key}Date`}
                      value={salaryData[`${key}Date` as keyof SalaryData]}
                      onChange={handleSalaryChange}
                      className="w-full mt-2 p-2 border rounded-md text-sm"
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Balance (€)
              </label>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm font-medium">Total Salary (€)</label>
            <input
              type="number"
              readOnly
              value={calculateTotalSalary().toFixed(2)}
              className="w-full mt-1 p-2 border rounded-md bg-gray-100"
            />
          </div>
        </fieldset>

        {/* Expense Sections */}
        {[
          ["Needs", NEEDS_FIELDS],
          ["Wants", WANTS_FIELDS],
          ["Savings", SAVINGS_FIELDS],
        ].map((item) => {
          const label = item[0] as string;
          const fields = item[1] as readonly ExpenseField[];
          return (
            <fieldset
              key={label}
              className="border border-blue-200 p-4 rounded-lg"
            >
              <legend className="text-blue-700 font-semibold">{label}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {fields.map((f) => (
                  <div key={f}>
                    <label className="text-sm font-medium text-gray-700">
                      {f} (€)
                    </label>
                    <input
                      type="number"
                      name={f}
                      value={expenses[f]}
                      onChange={handleExpenseChange}
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          );
        })}

        {/* Action Buttons */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 shadow"
          >
            💡 Calculate Budget
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 shadow"
          >
            💾 Save Budget
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-red-600 text-white px-6 py-3 ml-4 rounded-md hover:bg-red-700 shadow"
          >
            Clear All
          </button>
        </div>
      </form>

      {/* Alerts + Summary + Chart */}
      {summary && (
        <div className="bg-white mt-10 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📊 Summary</h2>

          {/* Alerts */}
          {alerts.map((msg, i) => (
            <div
              key={i}
              className={`p-3 mb-2 rounded-md font-medium ${
                msg.includes("✅")
                  ? "bg-green-100 text-green-800"
                  : msg.includes("⚠️")
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {msg}
            </div>
          ))}

          {/* Structured Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Income & Expense Overview */}
            <div className="bg-gray-50 p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold mb-2">
                💼 Income & Expenses
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Month</td>
                    <td>{month}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Total Income</td>
                    <td>€{calculateTotalSalary().toFixed(2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Total Expenses</td>
                    <td>
                      €
                      {(
                        [
                          ...NEEDS_FIELDS,
                          ...WANTS_FIELDS,
                          ...SAVINGS_FIELDS,
                        ] as ExpenseField[]
                      )
                        .reduce((a, f) => a + (+expenses[f] || 0), 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Remaining Balance</td>
                    <td
                      className={(() => {
                        const totalIncome = calculateTotalSalary();
                        const totalExpenses = (
                          [
                            ...NEEDS_FIELDS,
                            ...WANTS_FIELDS,
                            ...SAVINGS_FIELDS,
                          ] as ExpenseField[]
                        ).reduce((a, f) => a + (+expenses[f] || 0), 0);
                        return totalIncome - totalExpenses < 0
                          ? "text-red-600 font-semibold"
                          : "text-green-600 font-semibold";
                      })()}
                    >
                      €
                      {(() => {
                        const totalIncome = calculateTotalSalary();
                        const totalExpenses = (
                          [
                            ...NEEDS_FIELDS,
                            ...WANTS_FIELDS,
                            ...SAVINGS_FIELDS,
                          ] as ExpenseField[]
                        ).reduce((a, f) => a + (+expenses[f] || 0), 0);
                        return (totalIncome - totalExpenses).toFixed(2);
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expense Distribution */}
            <div className="bg-gray-50 p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold mb-2">📌 Distribution</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Category</th>
                    <th>Actual</th>
                    <th>Ideal</th>
                    <th>% Used</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Needs",
                      actual: NEEDS_FIELDS.reduce(
                        (a, f) => a + (+expenses[f] || 0),
                        0
                      ),
                      ideal: calculateTotalSalary() * 0.5,
                    },
                    {
                      label: "Wants",
                      actual: WANTS_FIELDS.reduce(
                        (a, f) => a + (+expenses[f] || 0),
                        0
                      ),
                      ideal: calculateTotalSalary() * 0.3,
                    },
                    {
                      label: "Savings",
                      actual: SAVINGS_FIELDS.reduce(
                        (a, f) => a + (+expenses[f] || 0),
                        0
                      ),
                      ideal: calculateTotalSalary() * 0.2,
                    },
                  ].map(({ label, actual, ideal }) => (
                    <tr key={label} className="border-b">
                      <td className="py-2 font-medium">{label}</td>
                      <td>€{actual.toFixed(2)}</td>
                      <td>€{ideal.toFixed(2)}</td>
                      <td>
                        {((actual / calculateTotalSalary()) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Salary Dates */}
            <div className="bg-gray-50 p-4 rounded-md shadow col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">
                📅 Salary Credited Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Part-Time:</span>{" "}
                  {salaryData.partTimeDate || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Mini Job:</span>{" "}
                  {salaryData.miniJobDate || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Blocked Account:</span>{" "}
                  {salaryData.blockedMoneyDate || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}

          {/* Chart */}
          {/* Budget Utilization Bars */}
<div className="mt-6 space-y-4">
  <h3 className="text-lg font-semibold mb-2">📈 Budget Utilization Overview</h3>
  {[
    {
      label: "Needs",
      actual: NEEDS_FIELDS.reduce((a, f) => a + (+expenses[f] || 0), 0),
      ideal: calculateTotalSalary() * 0.5,
      color: "bg-blue-500",
    },
    {
      label: "Wants",
      actual: WANTS_FIELDS.reduce((a, f) => a + (+expenses[f] || 0), 0),
      ideal: calculateTotalSalary() * 0.3,
      color: "bg-yellow-500",
    },
    {
      label: "Savings",
      actual: SAVINGS_FIELDS.reduce((a, f) => a + (+expenses[f] || 0), 0),
      ideal: calculateTotalSalary() * 0.2,
      color: "bg-green-500",
    },
  ].map(({ label, actual, ideal, color }) => {
    const percentUsed = ((actual / ideal) * 100).toFixed(1);
    return (
      <div key={label}>
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>{label} - €{actual.toFixed(2)} / €{ideal.toFixed(2)}</span>
          <span>{percentUsed}% used</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`${color} h-4 rounded-full`}
            style={{ width: `${Math.min(+percentUsed, 100)}%` }}
          />
        </div>
      </div>
    );
  })}
</div>

        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;
