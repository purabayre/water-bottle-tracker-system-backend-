const express = require("express");
const router = express.Router();

const { exportMonthlyReport } = require("../controllers/exportController");
const { heavyLimiter } = require("../middleware/rateLimiter");

router.get("/monthly", heavyLimiter, exportMonthlyReport);

module.exports = router;
