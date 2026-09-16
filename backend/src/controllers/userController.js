const User = require("../models/User");
const { distanceKm } = require("../utils/geo");

// POST /api/users/register
async function registerUser(req, res, next) {
  try {
    const { name, email, password, phone, role, bloodGroup, area, organization } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Only persist role-relevant fields. An empty string for bloodGroup
    // (e.g. sent by a requester) is a defined value as far as Mongoose's
    // enum validator is concerned, so it must be left out entirely
    // (undefined) rather than passed through as "".
    const userData = { name, email, password, phone, role };
    if (role === "donor") {
      userData.bloodGroup = bloodGroup;
      userData.area = area;
    } else {
      userData.organization = organization;
    }

    const user = await User.create(userData);

    res.status(201).json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

// POST /api/users/login
// Plain email+password+role match for now — real credential verification
// (hashed password compare + JWT issuance) is added in Experiment 6.
async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

// GET /api/users/donors?bloodGroup=O+&available=true&lat=..&lng=..&radiusKm=25
// When lat/lng are supplied, results are annotated with distanceKm and
// sorted nearest-first; donors without a saved location sort to the end.
async function listDonors(req, res, next) {
  try {
    const { bloodGroup, available, lat, lng, radiusKm } = req.query;
    const filter = { role: "donor" };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (available !== undefined) filter.isAvailable = available === "true";

    let donors = await User.find(filter).select("-password");

    if (lat && lng) {
      const originLat = Number(lat);
      const originLng = Number(lng);
      const radius = radiusKm ? Number(radiusKm) : null;

      donors = donors
        .map((d) => {
          const obj = d.toObject();
          obj.distanceKm = distanceKm(originLat, originLng, d.location?.lat, d.location?.lng);
          return obj;
        })
        .filter((d) => !radius || d.distanceKm === null || d.distanceKm <= radius)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
    }

    res.json(donors);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id — used right now to save a donor's/requester's
// live location once the browser's Geolocation API returns it, and for
// a donor to toggle their availability.
async function updateUser(req, res, next) {
  try {
    const allowedFields = ["location", "isAvailable", "area", "phone"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { registerUser, loginUser, listDonors, getUser, updateUser };
