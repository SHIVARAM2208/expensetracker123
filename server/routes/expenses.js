const express = require("express");
const Expense = require("../models/Expense");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Set initial balance
router.post("/balance", auth, async (req, res) => {
  const { balance } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.balance = balance;
    await user.save();
    res.json({ balance: user.balance });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Add expense
router.post("/", auth, async (req, res) => {
  const { amount, date, paymentType, category, description } = req.body;
  try {
    const expense = new Expense({
      user: req.user.id, amount, date, paymentType, category, description
    });
    await expense.save();

    // Subtract from balance
    const user = await User.findById(req.user.id);
    user.balance -= amount;
    await user.save();

    res.json({ expense, balance: user.balance });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all expenses
router.get("/", auth, async (req, res) => {
  const { sortBy, order } = req.query; // sortBy: 'amount'/'date', order: 'asc'/'desc'
  let sort = { createdAt: -1 };
  if (sortBy) sort = { [sortBy]: order === "asc" ? 1 : -1 };
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort(sort);
    const user = await User.findById(req.user.id);
    res.json({ expenses, balance: user.balance });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Edit expense
router.put("/:id", auth, async (req, res) => {
  const { amount, date, paymentType, category, description } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: "Expense not found" });
    if (expense.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    // Update balance
    const user = await User.findById(req.user.id);
    user.balance += expense.amount; // revert old expense
    expense.amount = amount;
    expense.date = date;
    expense.paymentType = paymentType;
    expense.category = category;
    expense.description = description;
    await expense.save();
    user.balance -= amount; // subtract new amount
    await user.save();

    res.json({ expense, balance: user.balance });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
