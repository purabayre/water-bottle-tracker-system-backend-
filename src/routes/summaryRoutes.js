const express = require("express");
const router = express.Router();

const { getMonthlySummary } = require("../controllers/summaryController");
const { generalLimiter } = require("../middleware/rateLimiter");

router.get("/", generalLimiter, getMonthlySummary);

module.exports = router;
