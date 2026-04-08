const express = require("express");
const router = express.Router();
const { generateMonthlyPDF } = require("../controllers/pdfController");


router.get("/monthly", generateMonthlyPDF);

module.exports = router;
