import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bloodGroups } from "../data/mockData";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  bloodGroup: "",
  area: "",
  organization: "",
  password: "",
};

export default function Register() {
  const [role, setRole] = useState("donor");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Only send the fields relevant to the chosen role. Sending an
      // empty bloodGroup for a requester previously tripped Mongoose's
      // enum validator, since "" is a defined (but invalid) value —
      // only a genuinely absent field skips enum validation.
      const payload =
        role === "donor"
          ? { name: form.name, email: form.email, phone: form.phone, password: form.password, role, bloodGroup: form.bloodGroup, area: form.area }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password, role, organization: form.organization };

      // Persisted to MongoDB via the Experiment 4 users API.
      await register(payload);
      navigate(role === "donor" ? "/donor" : "/requester");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-crimson">
        Join the network
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Register as a donor to receive alerts, or as a requester to post
        emergency needs.
      </p>

      {/* Role toggle */}
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-line bg-white p-1">
        <button
          type="button"
          onClick={() => setRole("donor")}
          className={`rounded-full py-2 text-sm font-medium transition-colors ${
            role === "donor" ? "bg-crimson text-white" : "text-ink-soft"
          }`}
        >
          I'm a Donor
        </button>
        <button
          type="button"
          onClick={() => setRole("requester")}
          className={`rounded-full py-2 text-sm font-medium transition-colors ${
            role === "requester" ? "bg-crimson text-white" : "text-ink-soft"
          }`}
        >
          I'm a Requester
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Full name" placeholder="Your name" value={form.name} onChange={update("name")} required />
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          required
        />
        <Field
          label="Phone number"
          type="tel"
          placeholder="+91 "
          value={form.phone}
          onChange={update("phone")}
          required
        />

        {role === "donor" ? (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Blood group</span>
              <select
                required
                value={form.bloodGroup}
                onChange={update("bloodGroup")}
                className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-crimson"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Area / locality"
              placeholder="e.g. Andheri East, Mumbai"
              value={form.area}
              onChange={update("area")}
              required
            />
          </>
        ) : (
          <Field
            label="Organization (optional)"
            placeholder="Hospital / blood bank name"
            value={form.organization}
            onChange={update("organization")}
          />
        )}

        <Field
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={update("password")}
          minLength={6}
          required
        />

        {error && <p className="text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-crimson py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-dark disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-crimson hover:text-crimson-dark">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-crimson"
      />
    </label>
  );
}
