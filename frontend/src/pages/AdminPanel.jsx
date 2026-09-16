import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StatusBadge from "../components/StatusBadge";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";
import { fetchRequests } from "../store/requestsSlice";
import { fetchDonors } from "../store/donorsSlice";

export default function AdminPanel() {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: requests, status: requestsStatus } = useSelector((s) => s.requests);
  const { items: donors, status: donorsStatus } = useSelector((s) => s.donors);
  const { data: stats } = useFetch(() => api.get("/stats"), []);

  useEffect(() => {
    dispatch(fetchRequests({}));
    dispatch(fetchDonors({}));
  }, [dispatch]);

  function handleLogout() {
    adminLogout();
    navigate("/admin/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-crimson">
            Admin
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
            Network overview
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Active requests" value={stats?.activeRequests ?? "—"} tone="crimson" />
        <SummaryCard label="Registered donors" value={stats?.registeredDonors ?? "—"} tone="navy" />
        <SummaryCard label="Lives saved" value={stats?.livesSaved ?? "—"} tone="green" />
      </div>

      {/* Requests table — Redux, shared with Browse Requests / dashboards */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Emergency requests</h2>
          <span className="font-mono text-xs text-ink-soft">
            {requestsStatus === "loading" ? "Loading…" : `${requests.length} total`}
          </span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Group</th>
                <th className="px-5 py-3 font-medium">Units</th>
                <th className="px-5 py-3 font-medium">Hospital</th>
                <th className="px-5 py-3 font-medium">Urgency</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-5 py-3">{r.patientName}</td>
                  <td className="px-5 py-3 font-mono">{r.bloodGroup}</td>
                  <td className="px-5 py-3 font-mono">{r.unitsNeeded}</td>
                  <td className="px-5 py-3 text-ink-soft">{r.hospital}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.urgency} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Donors table — Redux */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Registered donors</h2>
          <span className="font-mono text-xs text-ink-soft">
            {donorsStatus === "loading" ? "Loading…" : `${donors.length} shown`}
          </span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Group</th>
                <th className="px-5 py-3 font-medium">Area</th>
                <th className="px-5 py-3 font-medium">Last donation</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {donors.map((d) => (
                <tr key={d._id}>
                  <td className="px-5 py-3">{d.name}</td>
                  <td className="px-5 py-3 font-mono">{d.bloodGroup}</td>
                  <td className="px-5 py-3 text-ink-soft">{d.area}</td>
                  <td className="px-5 py-3">
                    {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={d.isAvailable === false ? "unavailable" : "available"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    crimson: "text-crimson",
    navy: "text-navy",
    green: "text-green",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className={`font-mono text-3xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
