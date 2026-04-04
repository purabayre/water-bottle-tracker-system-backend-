const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      default: 5,
    },
    effective_from: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BottlePrice", priceSchema);
