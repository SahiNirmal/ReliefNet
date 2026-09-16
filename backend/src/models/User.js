const mongoose = require("mongoose");

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Plaintext for now — Experiment 6 (JWT auth) replaces this with a
    // bcrypt-hashed password and adds real login verification.
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["donor", "requester", "admin"], required: true },

    // Donor-only fields
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: function () {
        return this.role === "donor";
      },
      // A defensive fallback: an empty string is a defined value as far
      // as Mongoose's enum check is concerned, so it would otherwise
      // fail validation for non-donors. Converting "" to undefined here
      // means the field is simply skipped for requesters/admins, no
      // matter what a caller (frontend, Postman, etc.) sends.
      set: (v) => (v === "" ? undefined : v),
    },
    area: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Date, default: null },

    // Real coordinates, captured via the browser's Geolocation API on the
    // frontend and saved here so donor-to-request distance can actually
    // be computed server-side, instead of just showing raw lat/lng.
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    // Requester-only field
    organization: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;
