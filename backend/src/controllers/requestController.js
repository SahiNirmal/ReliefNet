const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const { distanceKm } = require("../utils/geo");

// GET /api/requests?bloodGroup=&urgency=&status=&requesterId=&lat=&lng=&radiusKm=
// When lat/lng are supplied, results are annotated with distanceKm
// (distance from that point to where the request was posted) and
// sorted nearest-first.
async function listRequests(req, res, next) {
  try {
    const { bloodGroup, urgency, status, requesterId, lat, lng, radiusKm } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;
    if (requesterId) filter.requester = requesterId;

    let requests = await BloodRequest.find(filter)
      .populate("requester", "name email organization")
      .sort({ createdAt: -1 });

    if (lat && lng) {
      const originLat = Number(lat);
      const originLng = Number(lng);
      const radius = radiusKm ? Number(radiusKm) : null;

      requests = requests
        .map((r) => {
          const obj = r.toObject();
          obj.distanceKm = distanceKm(originLat, originLng, r.location?.lat, r.location?.lng);
          return obj;
        })
        .filter((r) => !radius || r.distanceKm === null || r.distanceKm <= radius)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
    }

    res.json(requests);
  } catch (err) {
    next(err);
  }
}

// GET /api/requests/:id
async function getRequest(req, res, next) {
  try {
    const request = await BloodRequest.findById(req.params.id).populate(
      "requester",
      "name email organization"
    );
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json(request);
  } catch (err) {
    next(err);
  }
}

const NEARBY_RADIUS_KM = 25;

// POST /api/requests
// Also counts how many available, matching-blood-group donors are
// within NEARBY_RADIUS_KM of the request's location right now, and
// returns that count as `nearbyDonorsMatched`. This is a real,
// computed-at-this-moment number — not a live push to those donors'
// screens, which needs WebSockets (Experiment 8) to do properly.
async function createRequest(req, res, next) {
  try {
    const request = await BloodRequest.create(req.body);

    let nearbyDonorsMatched = null;
    if (request.location?.lat && request.location?.lng) {
      const candidateDonors = await User.find({
        role: "donor",
        bloodGroup: request.bloodGroup,
        isAvailable: true,
        "location.lat": { $ne: null },
      });
      nearbyDonorsMatched = candidateDonors.filter((d) => {
        const dist = distanceKm(request.location.lat, request.location.lng, d.location.lat, d.location.lng);
        return dist !== null && dist <= NEARBY_RADIUS_KM;
      }).length;
    }

    res.status(201).json({ ...request.toObject(), nearbyDonorsMatched });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/requests/:id
async function updateRequest(req, res, next) {
  try {
    const request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json(request);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/requests/:id
async function deleteRequest(req, res, next) {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listRequests, getRequest, createRequest, updateRequest, deleteRequest };
