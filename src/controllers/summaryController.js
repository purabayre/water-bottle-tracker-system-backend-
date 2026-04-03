const MonthlySummary = require("../models/MonthlySummary");

exports.getMonthlySummary = (req, res, next) => {
  const { month, year } = req.query;

  MonthlySummary.findOne({ month: Number(month), year: Number(year) })
    .then((summary) => {
      if (!summary) {
        return res.json({
          total_bottles: 0,
          total_amount: 0,
          delivery_days: 0,
        });
      }

      res.json(summary);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
