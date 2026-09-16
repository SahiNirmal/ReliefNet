import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const ok = adminLogin(username, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-navy">
        Restricted access
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
        Admin sign in
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        This panel is for ReliefNet administrators only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Admin username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-navy"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-navy"
          />
        </label>

        {error && <p className="text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-full bg-navy py-3 text-sm font-medium text-white transition-colors hover:bg-navy/90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
