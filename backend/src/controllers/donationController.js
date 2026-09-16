const Donation = require("../models/Donation");
const BloodRequest = require("../models/BloodRequest");

// GET /api/donations?donorId=...&requestId=...
// Populated differently depending on who's asking: a donor viewing their
// own history mainly needs to know which request it was; a requester
// viewing responses to their request needs the donor's contact details
// so the two can actually get in touch.
async function listDonations(req, res, next) {
  try {
    const { donorId, requestId } = req.query;
    const filter = {};
    if (donorId) filter.donor = donorId;
    if (requestId) filter.request = requestId;

    const donations = await Donation.find(filter)
      .populate("donor", "name phone email bloodGroup area")
      .populate("request", "patientName hospital contactNumber")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    next(err);
  }
}

// POST /api/donations — a donor responds to a request. This only
// registers interest and shares contact details both ways; it does
// NOT mark the request fulfilled. The request stays "open" until the
// requester themselves confirms via PATCH /api/requests/:id, since only
// the requester knows whether blood was actually received.
async function createDonation(req, res, next) {
  try {
    const { donor, request, hospital, units } = req.body;
    const donation = await Donation.create({
      donor,
      request,
      hospital,
      units,
      status: "scheduled",
    });
    const populated = await donation.populate([
      { path: "donor", select: "name phone email bloodGroup area" },
      { path: "request", select: "patientName hospital contactNumber" },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id — the requester (or donor) updates a
// response's status once blood is actually collected, e.g. to
// "completed" or "cancelled".
async function updateDonation(req, res, next) {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: "donor", select: "name phone email bloodGroup area" },
      { path: "request", select: "patientName hospital contactNumber" },
    ]);
    if (!donation) return res.status(404).json({ message: "Donation not found." });
    res.json(donation);
  } catch (err) {
    next(err);
  }
}

// GET /api/stats — powers the admin panel's summary cards
async function getStats(req, res, next) {
  try {
    const [activeRequests, registeredDonors, livesSaved] = await Promise.all([
      BloodRequest.countDocuments({ status: "open" }),
      require("../models/User").countDocuments({ role: "donor" }),
      Donation.countDocuments({ status: "completed" }),
    ]);
    res.json({ activeRequests, registeredDonors, livesSaved });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDonations, createDonation, updateDonation, getStats };