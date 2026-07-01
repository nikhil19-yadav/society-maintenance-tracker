import { useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import type { Category, Complaint, ComplaintStatus, Priority } from "../types";
import { CategoryBadge, PriorityBadge, StatusBadge } from "./Badge";
import { formatRelative } from "../lib/utils";
import { Clipboard, Photo, Plus, Search, Warning } from "./Icons";
import { EmptyState } from "./EmptyState";
import { NewComplaintModal } from "./NewComplaintModal";
import { ComplaintDetailModal } from "./ComplaintDetailModal";

const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Lift",
  "Security",
  "Parking",
  "Other",
];

const STATUSES: ("All" | ComplaintStatus)[] = [
  "All",
  "Open",
  "In Progress",
  "Resolved",
];

const PRIORITIES: ("All" | Priority)[] = ["All", "Low", "Medium", "High"];

export function ComplaintsView() {
  const { state, currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [pri, setPri] = useState<(typeof PRIORITIES)[number]>("All");
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const filtered = useMemo(() => {
    return state.complaints.filter((c) => {
      if (onlyMine && c.residentId !== currentUser?.id) return false;
      if (onlyOverdue && !c.overdue) return false;
      if (cat !== "All" && c.category !== cat) return false;
      if (status !== "All" && c.status !== status) return false;
      if (pri !== "All" && c.priority !== pri) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !c.residentName.toLowerCase().includes(q) &&
          !c.flat.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [state.complaints, query, cat, status, pri, onlyMine, onlyOverdue, currentUser]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Complaints
          </h1>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? "Manage and respond to resident complaints."
              : "Track and raise maintenance complaints."}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Raise complaint
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
          <div className="sm:col-span-12 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, resident or flat…"
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="sm:col-span-4">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as typeof cat)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <select
              value={pri}
              onChange={(e) => setPri(e.target.value as typeof pri)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All priorities" : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
          {!isAdmin && (
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
                className="rounded border-slate-300"
              />
              My complaints only
            </label>
          )}
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              className="rounded border-slate-300"
            />
            Overdue only
          </label>
          <span className="text-slate-400 ml-auto">
            Showing {filtered.length} of {state.complaints.length}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={<Clipboard className="h-5 w-5" />}
            title="No complaints found"
            description={
              isAdmin
                ? "No complaints match the current filters."
                : "You haven't raised any complaints yet."
            }
            action={
              !isAdmin && (
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" /> Raise a complaint
                </button>
              )
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelected(c)}
                className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 leading-snug">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.overdue && c.status !== "Resolved" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                        <Warning className="h-3 w-3" /> Overdue
                      </span>
                    )}
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {c.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <CategoryBadge category={c.category} />
                  <PriorityBadge priority={c.priority} />
                  {c.photos.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Photo className="h-3 w-3" /> {c.photos.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    {c.residentName} · Flat {c.flat}
                  </span>
                  <span title={c.createdAt}>{formatRelative(c.createdAt)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewComplaintModal open={open} onClose={() => setOpen(false)} />
      <ComplaintDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        complaint={selected}
      />
    </div>
  );
}
