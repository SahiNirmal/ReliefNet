const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.get("/", listRequests);
router.get("/:id", getRequest);

router.post(
  "/",
  [
    body("requester").notEmpty().withMessage("requester is required."),
    body("patientName").trim().notEmpty().withMessage("Patient name is required."),
    body("bloodGroup").notEmpty().withMessage("Blood group is required."),
    body("unitsNeeded").isInt({ min: 1 }).withMessage("Units needed must be at least 1."),
    body("hospital").trim().notEmpty().withMessage("Hospital is required."),
    body("urgency").isIn(["critical", "urgent", "stable"]).withMessage("Invalid urgency level."),
    body("contactNumber").trim().notEmpty().withMessage("Contact number is required."),
  ],
  validate,
  createRequest
);

router.patch("/:id", updateRequest);
router.delete("/:id", deleteRequest);

module.exports = router;
