const BottlePrice = require("../models/BottlePrice");

exports.setPrice = async (req, res, next) => {
  try {
    const { price } = req.body;

    if (price !== undefined && price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    const newPrice = new BottlePrice({
      ...(price !== undefined && { price }),
      effective_from: new Date(),
    });

    const saved = await newPrice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).send("server error");
  }
};

exports.getCurrentPrice = async (req, res, next) => {
  try {
    const price = await BottlePrice.findOne().sort({ effective_from: -1 });

    if (!price) {
      return res.status(404).json({ message: "No price set" });
    }

    res.json(price);
  } catch (err) {
    res.status(500).send("server error");
  }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    const prices = await BottlePrice.find().sort({ effective_from: -1 });
    res.json(prices);
  } catch (err) {
    res.status(500).send("server error");
  }
};
