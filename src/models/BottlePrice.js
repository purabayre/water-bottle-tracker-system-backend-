const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    effective_from: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BottlePrice", priceSchema);
