const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget'); // adjust the path if different

// ➕ POST /api/budgets — Save or update budget
router.post('/', async (req, res) => {
  const { month, salaryData, expenses } = req.body;

  try {
    const budget = await Budget.findOneAndUpdate(
      { month },
      { salaryData, expenses },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(budget);
  } catch (err) {
    console.error('❌ Error saving budget data:', err);
    res.status(500).json({ message: 'Failed to save budget data' });
  }
});

// ✅ GET /api/budgets/:month — Fetch budget
router.get('/:month', async (req, res) => {
  try {
    const budget = await Budget.findOne({ month: req.params.month });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.status(200).json(budget);
  } catch (err) {
    console.error('❌ Error fetching budget data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
