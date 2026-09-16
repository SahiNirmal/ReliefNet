import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Now backed by the real Experiment 4 API — the backend looks up
      // the account and returns its actual role, so the form no longer
      // needs to ask "donor or requester?" itself.
      const loggedInUser = await login({ email, password });
      const from = location.state?.from;
      navigate(from || (loggedInUser.role === "donor" ? "/donor" : "/requester"));
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-crimson">
        Welcome back
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        Log in to ReliefNet
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Track requests, respond to alerts, and manage your donation history.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft">
            <input type="checkbox" className="h-4 w-4 rounded border-line accent-crimson" />
            Remember me
          </label>
          <a href="#" className="font-medium text-crimson hover:text-crimson-dark">
            Forgot password?
          </a>
        </div>

        {error && <p className="text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-crimson py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-dark disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to ReliefNet?{" "}
        <Link to="/register" className="font-medium text-crimson hover:text-crimson-dark">
          Create an account
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
