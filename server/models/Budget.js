const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  salaryData: {
    partTime: String,
    miniJob: String,
    blockedMoney: String,
    partTimeDate: String,
    miniJobDate: String,
    blockedMoneyDate: String,
  },
expenses: {
  Rent: String,
  Transport: String,
  Tax: String,
  Grocery: String,
  Recharge: String,
  Gym: String,
  LoansEMI: String,
  OtherExpenses: String,        
  Clothing: String,
  Food: String,
  Movies: String,
  Subscriptions: String,
  Emergency: String,
  MutualFunds: String       
},

});

module.exports = mongoose.model('Budget', budgetSchema);
