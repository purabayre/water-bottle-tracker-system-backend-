const express = require("express");
const router = express.Router();

const {
  addEntry,
  getMonthlyEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/entryController");
const { generalLimiter } = require("../middleware/rateLimiter");

router.post("/add", generalLimiter, addEntry);
router.get("/month", generalLimiter, getMonthlyEntries);
router.put("/update/:id", generalLimiter, updateEntry);
router.delete("/delete/:id", generalLimiter, deleteEntry);

module.exports = router;
