const BottleEntry = require("../models/BottleEntry");
const MonthlySummary = require("../models/MonthlySummary");

exports.updateMonthlySummary = async (month, year) => {
  try {
    const result = await BottleEntry.aggregate([
      { $match: { month, year } },
      {
        $group: {
          _id: null,
          total_bottles: { $sum: { $ifNull: ["$bottle_count", 0] } },
          total_amount: { $sum: { $ifNull: ["$amount", 0] } },
          delivery_days: { $sum: 1 },
        },
      },
    ]);

    const summary = result[0] || {
      total_bottles: 0,
      total_amount: 0,
      delivery_days: 0,
    };

    return await MonthlySummary.findOneAndUpdate(
      { month, year },
      {
        total_bottles: summary.total_bottles,
        total_amount: summary.total_amount,
        delivery_days: summary.delivery_days,
      },
      {
        new: true,
        upsert: true,
      },
    );
  } catch (err) {
    throw err;
  }
};
