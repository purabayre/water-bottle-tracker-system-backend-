const BottleEntry = require("../models/BottleEntry");
const BottlePrice = require("../models/BottlePrice");
const { updateMonthlySummary } = require("../services/summaryService");

exports.addEntry = (req, res, next) => {
  const { date, bottle_count } = req.body;

  if (!date || bottle_count === undefined) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (!Number.isInteger(bottle_count)) {
    return res
      .status(400)
      .json({ message: "Bottle count must be whole number" });
  }

  BottleEntry.findOne({ date: date })
    .then((existing) => {
      if (existing) {
        return res
          .status(400)
          .json({ message: "Entry already exists for this date" });
      }

      return BottlePrice.findOne().sort({ effective_from: -1 });
    })
    .then((priceData) => {
      if (!priceData) {
        return res.status(400).json({ message: "Set price first" });
      }

      const price = priceData.price;

      const entryDate = new Date(date);
      const month = entryDate.getMonth() + 1;
      const year = entryDate.getFullYear();

      const amount = bottle_count * price;

      const newEntry = new BottleEntry({
        date,
        bottle_count,
        price_per_bottle: price,
        amount,
        month,
        year,
      });

      return newEntry.save();
    })
    .then((saved) => {
      return updateMonthlySummary(saved.month, saved.year).then(() => {
        res.json({
          message: "Entry added",
          data: saved,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getMonthlyEntries = (req, res, next) => {
  const { month, year } = req.query;

  BottleEntry.find({ month: Number(month), year: Number(year) })
    .sort({ date: 1 })
    .then((entries) => {
      let total_bottles = 0;
      let total_amount = 0;

      entries.forEach((e) => {
        total_bottles += e.bottle_count;
        total_amount += e.amount;
      });

      res.json({
        entries,
        summary: {
          total_bottles,
          total_amount,
          delivery_days: entries.length,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.updateEntry = (req, res, next) => {
  const { id } = req.params;
  const { bottle_count } = req.body;

  if (!Number.isInteger(bottle_count)) {
    return res
      .status(400)
      .json({ message: "Bottle count must be whole number" });
  }

  BottleEntry.findById(id)
    .then((entry) => {
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      const newAmount = bottle_count * entry.price_per_bottle;

      return BottleEntry.findByIdAndUpdate(
        id,
        {
          bottle_count,
          amount: newAmount,
        },
        { new: true },
      );
    })
    .then((updated) => {
      if (!updated) return;

      return updateMonthlySummary(updated.month, updated.year).then(() => {
        res.json({
          message: "Entry updated",
          data: updated,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.deleteEntry = (req, res, next) => {
  const { id } = req.params;

  let deletedEntry = null;

  BottleEntry.findById(id)
    .then((entry) => {
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      deletedEntry = entry;

      return BottleEntry.findByIdAndDelete(id);
    })
    .then(() => {
      if (!deletedEntry) return;

      return updateMonthlySummary(deletedEntry.month, deletedEntry.year).then(
        () => {
          res.json({ message: "Entry deleted successfully" });
        },
      );
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
