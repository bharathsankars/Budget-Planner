const Budget = require('../models/Budget');

exports.createBudget = async (req, res) => {
  try {
    const budget = new Budget(req.body);
    const saved = await budget.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBudgetByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const budget = await Budget.findOne({ month });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
