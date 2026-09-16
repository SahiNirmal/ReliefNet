import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RequestCard from "../components/RequestCard";
import { bloodGroups } from "../data/mockData";
import { fetchRequests, setFilters } from "../store/requestsSlice";
import { useAuth } from "../hooks/useAuth";

const urgencyFilters = ["all", "critical", "urgent", "stable"];

export default function BrowseRequests() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { items, status, filters } = useSelector((s) => s.requests);

  // Redux Toolkit's createAsyncThunk (used inside fetchRequests) wraps
  // useEffect internally-equivalent logic: dispatching it here re-runs
  // the API call whenever the filters in the store change.
  useEffect(() => {
    dispatch(fetchRequests({ bloodGroup: filters.bloodGroup, status: "open" }));
  }, [dispatch, filters]);

  const loading = status === "loading";

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-wider text-crimson">
        Live feed
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        Active emergency requests
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {loading
          ? "Loading active requests…"
          : `${items.length} request${items.length !== 1 ? "s" : ""} matching your filters.`}
      </p>

      {/* Filters — dispatched to the Redux store, shared by anything that reads requests.filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filters.bloodGroup === "all"} onClick={() => dispatch(setFilters({ bloodGroup: "all" }))}>
            All groups
          </FilterChip>
          {bloodGroups.map((bg) => (
            <FilterChip key={bg} active={filters.bloodGroup === bg} onClick={() => dispatch(setFilters({ bloodGroup: bg }))}>
              {bg}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {urgencyFilters.map((u) => (
          <FilterChip
            key={u}
            active={filters.urgency === u}
            onClick={() => dispatch(setFilters({ urgency: u }))}
            variant="outline"
          >
            {u === "all" ? "Any urgency" : u[0].toUpperCase() + u.slice(1)}
          </FilterChip>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-bg-alt" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-ink-soft">
            No requests match these filters right now. Try widening your
            search.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((r) => filters.urgency === "all" || r.urgency === filters.urgency)
              .map((r) => (
                <RequestCard
                  key={r._id}
                  request={toCardShape(r)}
                  hideActions={user?.role !== "donor"}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Adapts the backend's Mongo document shape to what RequestCard expects.
function toCardShape(r) {
  return {
    id: r._id,
    patientName: r.patientName,
    bloodGroup: r.bloodGroup,
    unitsNeeded: r.unitsNeeded,
    hospital: r.hospital,
    urgency: r.urgency,
    postedAgo: new Date(r.createdAt).toLocaleDateString(),
    contact: r.requester?.organization || r.requester?.name || "Requester",
  };
}

function FilterChip({ active, onClick, children, variant = "solid" }) {
  const base = "rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors border";
  const activeClasses =
    variant === "solid"
      ? "bg-crimson text-white border-crimson"
      : "bg-navy text-white border-navy";
  const inactiveClasses = "bg-white text-ink-soft border-line hover:border-ink";

  return (
    <button onClick={onClick} className={`${base} ${active ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
}
