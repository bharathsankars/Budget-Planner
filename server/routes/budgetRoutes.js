const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// GET budget data for a specific month
router.get('/:month', async (req, res) => {
  const { month } = req.params;

  try {
    const data = await Budget.findOne({ month });
    if (!data) {
      return res.status(404).json({ message: 'No budget data found for this month.' });
    }
    res.json(data);
  } catch (err) {
    console.error('Error fetching budget data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
