const BottlePrice = require("../models/BottlePrice");

exports.setPrice = (req, res, next) => {
  const { price } = req.body;

  if (price == null || price <= 0) {
    return res.status(400).json({ message: "Price must be a positive number" });
  }

  const newPrice = new BottlePrice({
    price,
    effective_from: new Date(),
  });

  newPrice
    .save()
    .then((saved) => res.status(201).json(saved))
    .catch((err) => res.status(500).json({ error: err.message }));
};
exports.getCurrentPrice = (req, res, next) => {
  BottlePrice.findOne()
    .sort({ effective_from: -1 })
    .then((price) => {
      if (!price) {
        return res.status(404).json({ message: "No price set" });
      }
      res.json(price);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

exports.getPriceHistory = (req, res, next) => {
  BottlePrice.find()
    .sort({ effective_from: -1 })
    .then((prices) => {
      res.json(prices);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
