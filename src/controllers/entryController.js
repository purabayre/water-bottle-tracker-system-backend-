const BottleEntry = require("../models/BottleEntry");
const BottlePrice = require("../models/BottlePrice");
const { updateMonthlySummary } = require("../services/summaryService");

// ADD
exports.addEntry = async (req, res, next) => {
  try {
    const { date, bottle_count } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const entryDate = new Date(date);

    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    entryDate.setUTCHours(0, 0, 0, 0);

    if (bottle_count === undefined) {
      return res.status(400).json({ message: "Bottle Count is required" });
    }

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    if (bottle_count <= 0) {
      return res
        .status(400)
        .json({ message: "negative bottles are not allowed" });
    }

    const existing = await BottleEntry.findOne({ date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Entry already exists for today" });
    }

    const priceData = await BottlePrice.findOne().sort({
      effective_from: -1,
    });

    const DEFAULT_PRICE = 5;
    const price = priceData?.price ?? DEFAULT_PRICE;

    const month = entryDate.getUTCMonth() + 1;
    const year = entryDate.getUTCFullYear();

    const amount = bottle_count * price;

    const newEntry = new BottleEntry({
      date,
      bottle_count,
      price_per_bottle: price,
      amount,
      month,
      year,
    });

    const saved = await newEntry.save();

    await updateMonthlySummary(month, year);

    const formatted = {
      ...saved.toObject(),
      id: saved._id.toString(),
    };

    delete formatted._id;
    delete formatted.__v;
    delete formatted.createdAt;
    delete formatted.updatedAt;

    return res.json({
      message: "Entry added",
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// MONTHLY ENTRIES
exports.getMonthlyEntries = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
      return res.status(400).json({
        message: "Month and year must be valid integers",
      });
    }

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        message: "Year must be between 2000 and 2100",
      });
    }
    const entries = await BottleEntry.find({
      month: monthNum,
      year: yearNum,
    })
      .sort({ date: 1 })
      .select("-__v -createdAt -updatedAt")
      .lean();

    let total_bottles = 0;
    let total_amount = 0;

    entries.forEach((e) => {
      total_bottles += e.bottle_count;
      total_amount += e.amount;
    });

    const formattedEntries = entries.map((e) => ({
      ...e,
      id: e._id.toString(),
    }));

    return res.json({
      summary: {
        total_bottles,
        total_amount,
        delivery_days: formattedEntries.length,
      },
      entries: formattedEntries,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// UPDATE
exports.updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bottle_count } = req.body;

    if (bottle_count === undefined) {
      return res.status(400).json({ message: "Bottle Count is required" });
    }

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    if (bottle_count <= 0) {
      return res
        .status(400)
        .json({ message: "negative bottles are not allowed" });
    }

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const newAmount = bottle_count * entry.price_per_bottle;

    const updated = await BottleEntry.findByIdAndUpdate(
      id,
      {
        bottle_count,
        amount: newAmount,
      },
      { new: true },
    );

    await updateMonthlySummary(updated.month, updated.year);

    const formatted = {
      ...updated.toObject(),
      id: updated._id,
    };

    delete formatted._id;
    delete formatted.__v;
    delete formatted.createdAt;
    delete formatted.updatedAt;

    return res.json({
      message: "Entry updated",
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// DELETE
exports.deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await BottleEntry.findByIdAndDelete(id);

    try {
      await updateMonthlySummary(entry.month, entry.year);
    } catch (summaryErr) {
      console.error("Monthly summary update failed after delete:", summaryErr);
    }

    return res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};
