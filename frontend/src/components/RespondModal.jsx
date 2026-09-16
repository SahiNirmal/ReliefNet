import StatusBadge from "./StatusBadge";

// Shown when a donor clicks "Respond": lets them review the requester's
// details before committing, since confirming shares the donor's own
// contact details with that requester.
export default function RespondModal({ request, onConfirm, onCancel, confirming }) {
  if (!request) return null;

  const requesterName = request.requester?.organization || request.requester?.name || "Requester";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-crimson">
              Respond to request
            </p>
            <h2 className="font-display mt-1 text-xl font-semibold">{request.patientName}</h2>
          </div>
          <StatusBadge status={request.urgency} />
        </div>

        <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
          <Row label="Blood group needed" value={request.bloodGroup} />
          <Row label="Units needed" value={request.unitsNeeded} />
          <Row label="Hospital" value={request.hospital} />
          <Row label="Requested by" value={requesterName} />
          <Row label="Requester contact" value={request.contactNumber} />
          {typeof request.distanceKm === "number" && (
            <Row label="Distance from you" value={`${request.distanceKm.toFixed(1)} km`} />
          )}
        </dl>

        <p className="mt-5 rounded-lg bg-bg-alt px-3 py-2.5 text-xs text-ink-soft">
          Confirming will share your name, phone number, email, and blood
          group with this requester so you can coordinate directly. This
          does not mark the request as fulfilled — only the requester can
          do that once they've actually received the blood.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-full bg-crimson py-2.5 text-sm font-medium text-white transition-colors hover:bg-crimson-dark disabled:opacity-60"
          >
            {confirming ? "Confirming…" : "Confirm & Respond"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}