const express = require("express");
const router = express.Router();
const { generateMonthlyPDF } = require("../controllers/pdfController");
const { heavyLimiter } = require("../middleware/rateLimiter");

router.get("/monthly", heavyLimiter, generateMonthlyPDF);

module.exports = router;
