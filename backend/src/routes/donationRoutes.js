const express = require("express");
const { listDonations, createDonation, updateDonation } = require("../controllers/donationController");

const router = express.Router();

router.get("/", listDonations);
router.post("/", createDonation);
router.patch("/:id", updateDonation);

module.exports = router;